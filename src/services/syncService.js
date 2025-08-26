import { encryptionService } from './encryptionService';
import { toast } from 'react-toastify';

class SyncService {
  constructor() {
    this.isEnabled = false;
    this.devices = new Map();
    this.connections = new Map();
    this.syncKey = null;
    this.deviceId = null;
    this.callbacks = [];
    this.syncQueue = [];
    this.lastSyncTime = 0;
    this.conflictResolver = null;
    
    this.initializeDevice();
    this.loadSettings();
  }

  async initializeDevice() {
    try {
      // Generate or load device ID
      let deviceId = localStorage.getItem('focusflow-device-id');
      if (!deviceId) {
        deviceId = this.generateDeviceId();
        localStorage.setItem('focusflow-device-id', deviceId);
      }
      this.deviceId = deviceId;

      // Load device info
      const deviceInfo = {
        id: deviceId,
        name: this.getDeviceName(),
        type: this.getDeviceType(),
        lastSeen: Date.now(),
        trusted: true,
        publicKey: null
      };

      this.devices.set(deviceId, deviceInfo);
      this.notifyStatusChange('device_initialized');
    } catch (error) {
      console.error('Failed to initialize device:', error);
    }
  }

  loadSettings() {
    const settings = JSON.parse(localStorage.getItem('focusflow-settings') || '{}');
    this.isEnabled = settings.syncEnabled || false;
    this.autoSync = settings.autoSync !== false;
    this.syncInterval = settings.syncInterval || 300000; // 5 minutes
    
    // Load trusted devices
    const trustedDevices = JSON.parse(localStorage.getItem('focusflow-trusted-devices') || '[]');
    trustedDevices.forEach(device => {
      this.devices.set(device.id, device);
    });
  }

  saveSettings(settings) {
    const currentSettings = JSON.parse(localStorage.getItem('focusflow-settings') || '{}');
    const updatedSettings = { ...currentSettings, ...settings };
    localStorage.setItem('focusflow-settings', JSON.stringify(updatedSettings));
    this.loadSettings();
  }

  saveTrustedDevices() {
    const trustedDevices = Array.from(this.devices.values())
      .filter(device => device.trusted && device.id !== this.deviceId);
    localStorage.setItem('focusflow-trusted-devices', JSON.stringify(trustedDevices));
  }

  generateDeviceId() {
    return `device-${Date.now()}-${Math.random().toString(36).substr(2, 12)}`;
  }

  getDeviceName() {
    const userAgent = navigator.userAgent;
    if (userAgent.includes('Mac')) return 'MacBook';
    if (userAgent.includes('Windows')) return 'Windows PC';
    if (userAgent.includes('Linux')) return 'Linux PC';
    if (userAgent.includes('iPhone')) return 'iPhone';
    if (userAgent.includes('iPad')) return 'iPad';
    if (userAgent.includes('Android')) return 'Android Device';
    return 'Unknown Device';
  }

  getDeviceType() {
    const userAgent = navigator.userAgent;
    if (userAgent.includes('Mobile') || userAgent.includes('Android') || userAgent.includes('iPhone')) {
      return 'mobile';
    }
    if (userAgent.includes('iPad')) return 'tablet';
    return 'desktop';
  }

  async enableSync(passphrase) {
    try {
      // Generate sync key from passphrase
      this.syncKey = await encryptionService.deriveKey(passphrase);
      this.isEnabled = true;
      
      await this.saveSettings({ 
        syncEnabled: true,
        syncKey: await encryptionService.exportKey(this.syncKey)
      });
      
      if (this.autoSync) {
        this.startAutoSync();
      }
      
      this.notifyStatusChange('sync_enabled');
      toast.success('Cross-device sync enabled with encryption');
      
      return true;
    } catch (error) {
      console.error('Failed to enable sync:', error);
      toast.error('Failed to enable sync');
      return false;
    }
  }

  async disableSync() {
    try {
      this.isEnabled = false;
      this.syncKey = null;
      this.stopAutoSync();
      this.closeAllConnections();
      
      await this.saveSettings({ syncEnabled: false });
      localStorage.removeItem('focusflow-sync-key');
      
      this.notifyStatusChange('sync_disabled');
      toast.info('Cross-device sync disabled');
      
      return true;
    } catch (error) {
      console.error('Failed to disable sync:', error);
      return false;
    }
  }

  startAutoSync() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }
    
    this.syncInterval = setInterval(() => {
      this.discoverAndSync();
    }, 300000); // 5 minutes
  }

  stopAutoSync() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
  }

  async discoverAndSync() {
    if (!this.isEnabled || !this.syncKey) return;
    
    try {
      // In a real implementation, this would use WebRTC or other P2P discovery
      // For demo, we'll simulate discovery
      this.notifyStatusChange('sync_discovering');
      
      // Simulate finding devices
      await this.simulateDeviceDiscovery();
      
      // Sync with discovered devices
      await this.syncWithTrustedDevices();
      
    } catch (error) {
      console.error('Sync discovery failed:', error);
      this.notifyStatusChange('sync_error', error.message);
    }
  }

  async simulateDeviceDiscovery() {
    // Simulate discovering devices on the network
    const simulatedDevices = [
      {
        id: 'device-sim-laptop',
        name: 'Work Laptop',
        type: 'desktop',
        lastSeen: Date.now() - 120000,
        trusted: true,
        publicKey: 'sim-key-laptop'
      },
      {
        id: 'device-sim-phone',
        name: 'iPhone',
        type: 'mobile',
        lastSeen: Date.now() - 300000,
        trusted: true,
        publicKey: 'sim-key-phone'
      }
    ];

    // Only add if not already present
    simulatedDevices.forEach(device => {
      if (!this.devices.has(device.id)) {
        this.devices.set(device.id, device);
      }
    });

    this.saveTrustedDevices();
    this.notifyStatusChange('devices_discovered', simulatedDevices.length);
  }

  async syncWithTrustedDevices() {
    const trustedDevices = Array.from(this.devices.values())
      .filter(device => device.trusted && device.id !== this.deviceId);
    
    if (trustedDevices.length === 0) {
      this.notifyStatusChange('sync_idle');
      return;
    }

    this.notifyStatusChange('sync_in_progress');
    
    try {
      // Get local data to sync
      const localData = await this.getLocalSyncData();
      const encryptedData = await encryptionService.encrypt(JSON.stringify(localData), this.syncKey);
      
      // Simulate syncing with each device
      for (const device of trustedDevices) {
        await this.syncWithDevice(device, encryptedData);
      }
      
      this.lastSyncTime = Date.now();
      this.notifyStatusChange('sync_completed');
      toast.success(`Synced with ${trustedDevices.length} device(s)`);
      
    } catch (error) {
      console.error('Sync failed:', error);
      this.notifyStatusChange('sync_error', error.message);
      toast.error('Sync failed: ' + error.message);
    }
  }

  async syncWithDevice(device, encryptedData) {
    try {
      // Simulate WebRTC connection
      this.notifyStatusChange('sync_connecting', device.name);
      
      // Simulate data exchange
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update device last seen
      device.lastSeen = Date.now();
      this.devices.set(device.id, device);
      
      // Simulate receiving data back
      const remoteData = await this.simulateReceiveData(device);
      if (remoteData) {
        await this.mergeRemoteData(remoteData);
      }
      
    } catch (error) {
      console.error(`Failed to sync with ${device.name}:`, error);
      throw error;
    }
  }

  async simulateReceiveData(device) {
    // Simulate receiving encrypted data from remote device
    const mockRemoteData = {
      timeEntries: [],
      projects: [],
      settings: {},
      lastModified: Date.now() - Math.random() * 86400000 // Random within last day
    };
    
    return mockRemoteData;
  }

  async getLocalSyncData() {
    return {
      timeEntries: JSON.parse(localStorage.getItem('focusflow-time-entries') || '[]'),
      projects: JSON.parse(localStorage.getItem('focusflow-projects') || '[]'),
      settings: JSON.parse(localStorage.getItem('focusflow-settings') || '{}'),
      lastModified: Date.now()
    };
  }

  async mergeRemoteData(remoteData) {
    // Simple conflict resolution: prefer newer data
    const localData = await this.getLocalSyncData();
    
// Merge time entries
    const mergedEntries = this.mergeTimeEntries(localData.timeEntries, remoteData.timeEntries);
    localStorage.setItem('focusflow-time-entries', JSON.stringify(mergedEntries));
    
    // Merge projects
    const mergedProjects = this.mergeProjects(localData.projects, remoteData.projects);
    localStorage.setItem('focusflow-projects', JSON.stringify(mergedProjects));
    
    // Merge settings (prefer local for user preferences)
    const mergedSettings = { ...remoteData.settings, ...localData.settings };
    localStorage.setItem('focusflow-settings', JSON.stringify(mergedSettings));
  }

  mergeTimeEntries(local, remote) {
    const merged = [...local];
const localIds = new Set(local.map(entry => entry.Id));
    remote.forEach(remoteEntry => {
      const existingIndex = merged.findIndex(entry => entry.Id === remoteEntry.Id);
if (existingIndex >= 0) {
        // Conflict resolution: prefer newer modification time
        if (remoteEntry.lastModified > merged[existingIndex].lastModified) {
          merged[existingIndex] = remoteEntry;
        }
      } else {
        merged.push(remoteEntry);
      }
    });
    
    return merged;
  }

  mergeProjects(local, remote) {
    const merged = [...local];
    const localIds = new Set(local.map(project => project.Id));
    
    remote.forEach(remoteProject => {
      const existingIndex = merged.findIndex(project => project.Id === remoteProject.Id);
if (existingIndex >= 0) {
        if (remoteProject.lastModified > merged[existingIndex].lastModified) {
merged[existingIndex] = remoteProject;
        }
      } else {
        merged.push(remoteProject);
      }
    });
    
    return merged;
  }

  closeAllConnections() {
    this.connections.forEach(connection => {
      try {
        connection.close();
      } catch (error) {
        console.error('Error closing connection:', error);
      }
    });
    this.connections.clear();
  }

  async addTrustedDevice(deviceInfo, passphrase) {
    try {
      // Verify passphrase matches sync key
      const testKey = await encryptionService.deriveKey(passphrase);
      const keyMatch = await encryptionService.compareKeys(this.syncKey, testKey);
      
      if (!keyMatch) {
        throw new Error('Invalid passphrase');
      }
      
      deviceInfo.trusted = true;
      deviceInfo.addedAt = Date.now();
      this.devices.set(deviceInfo.id, deviceInfo);
      this.saveTrustedDevices();
      
      this.notifyStatusChange('device_added', deviceInfo.name);
      toast.success(`Added trusted device: ${deviceInfo.name}`);
      
      return true;
    } catch (error) {
      console.error('Failed to add trusted device:', error);
      toast.error('Failed to add device: ' + error.message);
      return false;
    }
  }

  removeTrustedDevice(deviceId) {
    const device = this.devices.get(deviceId);
    if (device) {
      this.devices.delete(deviceId);
      this.saveTrustedDevices();
      
      // Close any active connections
      if (this.connections.has(deviceId)) {
        this.connections.get(deviceId).close();
        this.connections.delete(deviceId);
      }
      
      this.notifyStatusChange('device_removed', device.name);
      toast.info(`Removed device: ${device.name}`);
      return true;
    }
    return false;
  }

  getTrustedDevices() {
    return Array.from(this.devices.values())
      .filter(device => device.trusted && device.id !== this.deviceId);
  }

  getCurrentDevice() {
    return this.devices.get(this.deviceId);
  }

  getSyncStatus() {
    return {
      enabled: this.isEnabled,
      lastSync: this.lastSyncTime,
      deviceCount: this.getTrustedDevices().length,
      currentDevice: this.getCurrentDevice(),
      encrypted: !!this.syncKey,
      autoSync: this.autoSync
    };
  }

  onStatusChange(callback) {
    this.callbacks.push(callback);
    return () => {
      const index = this.callbacks.indexOf(callback);
      if (index > -1) {
        this.callbacks.splice(index, 1);
      }
    };
  }

  notifyStatusChange(type, data = null) {
    this.callbacks.forEach(callback => {
      try {
        callback({
          type,
          data,
          timestamp: Date.now(),
          status: this.getSyncStatus()
        });
      } catch (error) {
        console.error('Error in sync status callback:', error);
      }
    });
  }

  // Manual sync trigger
  async triggerSync() {
    if (!this.isEnabled) {
      toast.warning('Sync is not enabled');
      return false;
    }
    
    try {
      await this.discoverAndSync();
      return true;
    } catch (error) {
      console.error('Manual sync failed:', error);
      return false;
    }
  }
}

// Export singleton instance
export const syncService = new SyncService();
export default syncService;