import { timeEntryService } from "@/services/api/timeEntryService";

class IdleDetectionService {
  constructor() {
    this.isMonitoring = false;
    this.lastActivity = Date.now();
    this.idleThreshold = 5 * 60 * 1000; // 5 minutes default
    this.checkInterval = 30 * 1000; // Check every 30 seconds
    this.intervalId = null;
    this.callbacks = [];
    
    // Bind methods to preserve context
    this.handleActivity = this.handleActivity.bind(this);
    this.checkIdleState = this.checkIdleState.bind(this);
    
    this.loadSettings();
  }

  loadSettings() {
    const settings = JSON.parse(localStorage.getItem('focusflow-settings') || '{}');
    this.idleThreshold = (settings.idleDetectionMinutes || 5) * 60 * 1000;
    this.customPrompts = settings.idlePrompts || [
      "Away from keyboard?",
      "Taking a break?",
      "Step away from your desk?",
      "What were you up to?"
    ];
    this.autoCategorizationEnabled = settings.autoIdleCategorization || false;
  }

  saveSettings(settings) {
    const currentSettings = JSON.parse(localStorage.getItem('focusflow-settings') || '{}');
    const updatedSettings = { ...currentSettings, ...settings };
    localStorage.setItem('focusflow-settings', JSON.stringify(updatedSettings));
    this.loadSettings();
  }

  getRandomPrompt() {
    const prompts = this.customPrompts;
    return prompts[Math.floor(Math.random() * prompts.length)];
  }

  startMonitoring() {
    if (this.isMonitoring) return;
    
    this.isMonitoring = true;
    this.lastActivity = Date.now();
    
    // Add activity listeners
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    events.forEach(event => {
      document.addEventListener(event, this.handleActivity, true);
    });
    
    // Start checking for idle state
    this.intervalId = setInterval(this.checkIdleState, this.checkInterval);
  }

  stopMonitoring() {
    if (!this.isMonitoring) return;
    
    this.isMonitoring = false;
    
    // Remove activity listeners
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    events.forEach(event => {
      document.removeEventListener(event, this.handleActivity, true);
    });
    
    // Clear interval
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  handleActivity() {
    this.lastActivity = Date.now();
  }

  async checkIdleState() {
    const now = Date.now();
    const idleTime = now - this.lastActivity;
    
    if (idleTime >= this.idleThreshold) {
      try {
        const activeEntry = await timeEntryService.getActiveEntry();
        if (activeEntry) {
          this.notifyIdleDetected(Math.floor(idleTime / 1000));
        }
      } catch (error) {
        console.error("Error checking active entry:", error);
      }
    }
  }

  notifyIdleDetected(idleTimeSeconds) {
    this.callbacks.forEach(callback => {
      try {
        callback({
          type: 'idle_detected',
          idleTime: idleTimeSeconds,
          customPrompt: this.getRandomPrompt(),
          timestamp: Date.now()
        });
      } catch (error) {
        console.error("Error in idle detection callback:", error);
      }
    });
  }

  onIdleDetected(callback) {
    this.callbacks.push(callback);
    return () => {
      const index = this.callbacks.indexOf(callback);
      if (index > -1) {
        this.callbacks.splice(index, 1);
      }
    };
  }

  async categorizeIdleTime(category, idleTimeSeconds) {
    try {
      const activeEntry = await timeEntryService.getActiveEntry();
      if (!activeEntry) return;

      const now = Date.now();
      const idleStartTime = now - (idleTimeSeconds * 1000);

      // Create idle time entry
      const idleEntry = await timeEntryService.create({
        projectId: activeEntry.projectId,
        description: `${category.label} (Auto-detected idle time)`,
        tags: [...(activeEntry.tags || []), 'idle-time', category.id],
        startTime: idleStartTime,
        endTime: now,
        duration: idleTimeSeconds,
        autoDetected: true,
        category: category.id
      });

      return idleEntry;
    } catch (error) {
      console.error("Error categorizing idle time:", error);
      throw error;
    }
  }

  getSettings() {
    return {
      idleDetectionMinutes: Math.floor(this.idleThreshold / 60000),
      idlePrompts: this.customPrompts,
      autoIdleCategorization: this.autoCategorizationEnabled
    };
  }
}

// Export singleton instance
export const idleDetectionService = new IdleDetectionService();
export default idleDetectionService;