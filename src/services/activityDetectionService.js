class ActivityDetectionService {
  constructor() {
    this.isMonitoring = false;
    this.activities = [];
    this.callbacks = [];
    this.intervalId = null;
    this.detectInterval = 15000; // Detect every 15 seconds
    this.maxActivities = 20; // Keep only recent 20 activities
    
    // Simulated activity sources
    this.activitySources = [
      {
        app: 'Slack',
        contexts: [
          'Discussing project requirements in #development',
          'Code review feedback in #code-review',
          'Daily standup updates in #team-updates',
          'Client communication in #client-support'
        ],
        category: 'Communication',
        icon: 'MessageSquare'
      },
      {
        app: 'VS Code',
        contexts: [
          'Writing React components in src/components/',
          'Debugging API integration issues',
          'Refactoring service layer architecture',
          'Implementing new dashboard features'
        ],
        category: 'Development',
        icon: 'Code'
      },
      {
        app: 'Chrome',
        contexts: [
          'Researching React best practices on Stack Overflow',
          'Reading documentation on MDN Web Docs',
          'Learning about AI integration patterns',
          'Checking email in Gmail'
        ],
        category: 'Research',
        icon: 'Globe'
      },
      {
        app: 'Figma',
        contexts: [
          'Designing user interface mockups',
          'Creating component library designs',
          'Collaborating on design system updates',
          'Prototyping new user flows'
        ],
        category: 'Design',
        icon: 'Palette'
      },
      {
        app: 'Notion',
        contexts: [
          'Updating project documentation',
          'Planning sprint objectives',
          'Writing meeting notes',
          'Organizing team knowledge base'
        ],
        category: 'Documentation',
        icon: 'FileText'
      },
      {
        app: 'Zoom',
        contexts: [
          'Client presentation meeting',
          'Team retrospective session',
          'One-on-one with manager',
          'Design review with stakeholders'
        ],
        category: 'Meetings',
        icon: 'Video'
      }
    ];
  }

  startMonitoring() {
    if (this.isMonitoring) return;
    
    this.isMonitoring = true;
    this.intervalId = setInterval(() => {
      this.simulateActivityDetection();
    }, this.detectInterval);
  }

  stopMonitoring() {
    if (!this.isMonitoring) return;
    
    this.isMonitoring = false;
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  simulateActivityDetection() {
    // Randomly decide if activity should be detected (70% chance)
    if (Math.random() < 0.3) return;

    const source = this.activitySources[Math.floor(Math.random() * this.activitySources.length)];
    const context = source.contexts[Math.floor(Math.random() * source.contexts.length)];
    
    const activity = {
id: `activity-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      app: source.app,
      context,
      category: source.category,
      icon: source.icon,
      duration: Math.floor(Math.random() * 600) + 120, // 2-12 minutes
      confidence: Math.floor(Math.random() * 30) + 70, // 70-100%
      status: 'pending' // pending, accepted, rejected
    };

    this.activities.unshift(activity);
    
    // Keep only recent activities
    if (this.activities.length > this.maxActivities) {
      this.activities = this.activities.slice(0, this.maxActivities);
    }

    this.notifyActivityDetected(activity);
  }

  notifyActivityDetected(activity) {
    this.callbacks.forEach(callback => {
      try {
        callback({
          type: 'activity_detected',
          activity,
          timestamp: Date.now()
        });
      } catch (error) {
        console.error("Error in activity detection callback:", error);
      }
    });
  }

  onActivityDetected(callback) {
    this.callbacks.push(callback);
    return () => {
      const index = this.callbacks.indexOf(callback);
      if (index > -1) {
        this.callbacks.splice(index, 1);
      }
    };
  }

  getAllActivities() {
    return [...this.activities];
  }

  getPendingActivities() {
    return this.activities.filter(activity => activity.status === 'pending');
  }

  acceptActivity(activityId) {
    const activity = this.activities.find(a => a.id === activityId);
    if (activity) {
      activity.status = 'accepted';
      return activity;
    }
    return null;
  }

  rejectActivity(activityId) {
    const activity = this.activities.find(a => a.id === activityId);
    if (activity) {
      activity.status = 'rejected';
      return activity;
    }
    return null;
  }

  clearActivity(activityId) {
    this.activities = this.activities.filter(a => a.id !== activityId);
  }

  getActivityStats() {
    const total = this.activities.length;
    const pending = this.activities.filter(a => a.status === 'pending').length;
    const accepted = this.activities.filter(a => a.status === 'accepted').length;
    const rejected = this.activities.filter(a => a.status === 'rejected').length;

    return { total, pending, accepted, rejected };
  }
}

// Export singleton instance
export const activityDetectionService = new ActivityDetectionService();
export default activityDetectionService;