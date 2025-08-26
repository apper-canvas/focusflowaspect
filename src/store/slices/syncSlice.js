import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  enabled: false,
  status: 'idle', // idle, discovering, connecting, syncing, completed, error
  lastSync: null,
  deviceCount: 0,
  currentDevice: null,
  devices: [],
  encrypted: false,
  autoSync: true,
  error: null,
  progress: {
    current: 0,
    total: 0,
    message: ''
  }
};

export const syncSlice = createSlice({
  name: 'sync',
  initialState,
  reducers: {
    setSyncEnabled: (state, action) => {
      state.enabled = action.payload;
      if (!action.payload) {
        state.status = 'idle';
        state.error = null;
      }
    },
    
    setSyncStatus: (state, action) => {
      state.status = action.payload;
      if (action.payload !== 'error') {
        state.error = null;
      }
    },
    
    setSyncError: (state, action) => {
      state.status = 'error';
      state.error = action.payload;
    },
    
    setLastSync: (state, action) => {
      state.lastSync = action.payload;
    },
    
    setDeviceCount: (state, action) => {
      state.deviceCount = action.payload;
    },
    
    setCurrentDevice: (state, action) => {
      state.currentDevice = action.payload;
    },
    
    setDevices: (state, action) => {
      state.devices = action.payload;
    },
    
    addDevice: (state, action) => {
      const existingIndex = state.devices.findIndex(d => d.id === action.payload.id);
      if (existingIndex >= 0) {
        state.devices[existingIndex] = action.payload;
      } else {
        state.devices.push(action.payload);
      }
      state.deviceCount = state.devices.filter(d => d.trusted && d.id !== state.currentDevice?.id).length;
    },
    
    removeDevice: (state, action) => {
      state.devices = state.devices.filter(d => d.id !== action.payload);
      state.deviceCount = state.devices.filter(d => d.trusted && d.id !== state.currentDevice?.id).length;
    },
    
    setEncrypted: (state, action) => {
      state.encrypted = action.payload;
    },
    
    setAutoSync: (state, action) => {
      state.autoSync = action.payload;
    },
    
    setSyncProgress: (state, action) => {
      state.progress = { ...state.progress, ...action.payload };
    },
    
    resetSyncProgress: (state) => {
      state.progress = { current: 0, total: 0, message: '' };
    },
    
    updateSyncStatus: (state, action) => {
      const { type, data, status } = action.payload;
      
      // Update status based on event type
      switch (type) {
        case 'sync_enabled':
          state.enabled = true;
          state.encrypted = true;
          state.status = 'idle';
          break;
        case 'sync_disabled':
          state.enabled = false;
          state.encrypted = false;
          state.status = 'idle';
          state.devices = [];
          state.deviceCount = 0;
          break;
        case 'sync_discovering':
          state.status = 'discovering';
          state.progress.message = 'Discovering devices...';
          break;
        case 'sync_connecting':
          state.status = 'connecting';
          state.progress.message = data ? `Connecting to ${data}...` : 'Connecting...';
          break;
        case 'sync_in_progress':
          state.status = 'syncing';
          state.progress.message = 'Syncing data...';
          break;
        case 'sync_completed':
          state.status = 'completed';
          state.lastSync = Date.now();
          state.progress.message = 'Sync completed';
          setTimeout(() => {
            if (state.status === 'completed') {
              state.status = 'idle';
            }
          }, 3000);
          break;
        case 'sync_error':
          state.status = 'error';
          state.error = data;
          state.progress.message = `Error: ${data}`;
          break;
        case 'devices_discovered':
          state.progress.message = `Found ${data} device(s)`;
          break;
        case 'device_added':
          state.progress.message = `Added ${data}`;
          break;
        case 'device_removed':
          state.progress.message = `Removed ${data}`;
          break;
        case 'sync_idle':
          state.status = 'idle';
          state.progress.message = '';
          break;
      }
      
      // Update with full status if provided
      if (status) {
        state.enabled = status.enabled;
        state.lastSync = status.lastSync;
        state.deviceCount = status.deviceCount;
        state.currentDevice = status.currentDevice;
        state.encrypted = status.encrypted;
        state.autoSync = status.autoSync;
      }
    }
  }
});

export const {
  setSyncEnabled,
  setSyncStatus,
  setSyncError,
  setLastSync,
  setDeviceCount,
  setCurrentDevice,
  setDevices,
  addDevice,
  removeDevice,
  setEncrypted,
  setAutoSync,
  setSyncProgress,
  resetSyncProgress,
  updateSyncStatus
} = syncSlice.actions;

export default syncSlice.reducer;