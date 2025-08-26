import React, { useState } from "react";
import { toast } from "react-toastify";
import ApperIcon from "@/components/ApperIcon";
import FormField from "@/components/molecules/FormField";
import Card from "@/components/atoms/Card";
import Button from "@/components/atoms/Button";

const Settings = () => {
  const [settings, setSettings] = useState({
    workDuration: 25,
    breakDuration: 5,
    longBreakDuration: 15,
    autoStart: false,
    soundNotifications: true,
    darkMode: false,
    weeklyGoal: 40,
    timezone: "local",
    exportFormat: "csv",
    // Idle detection settings
    idleDetectionEnabled: true,
    idleDetectionMinutes: 5,
    idlePrompts: [
      "Away from keyboard?",
      "Taking a break?", 
      "Step away from your desk?",
      "What were you up to?"
    ],
    autoIdleCategorization: false,
    // Calendar sync settings
    googleCalendarEnabled: false,
    outlookCalendarEnabled: false,
    appleCalendarEnabled: false,
    autoImportMeetings: true,
    syncFrequency: "hourly",
    includePersonalMeetings: false
  });

  const [activeSection, setActiveSection] = useState("pomodoro");

const sections = [
    { id: "pomodoro", label: "Pomodoro Timer", icon: "Timer" },
    { id: "notifications", label: "Notifications", icon: "Bell" },
    { id: "idle", label: "Idle Detection", icon: "Clock" },
    { id: "goals", label: "Goals & Targets", icon: "Target" },
    { id: "privacy", label: "Privacy & Data", icon: "Shield" },
    { id: "export", label: "Export Settings", icon: "Download" },
    { id: "calendar", label: "Calendar Sync", icon: "Calendar" }
  ];
  const handleSave = async () => {
    try {
      // In a real app, this would save to localStorage or API
      localStorage.setItem("focusflow-settings", JSON.stringify(settings));
      toast.success("Settings saved successfully");
    } catch (error) {
      toast.error("Failed to save settings");
      console.error("Save settings error:", error);
    }
  };

  const handleReset = () => {
    if (confirm("Are you sure you want to reset all settings to default?")) {
      setSettings({
        workDuration: 25,
        breakDuration: 5,
        longBreakDuration: 15,
        autoStart: false,
        soundNotifications: true,
        darkMode: false,
        weeklyGoal: 40,
        timezone: "local",
        exportFormat: "csv"
      });
      toast.info("Settings reset to default");
    }
  };

  const renderPomodoroSettings = () => (
    <div className="space-y-4">
      <FormField
        label="Work Duration (minutes)"
        type="number"
        value={settings.workDuration}
        onChange={(e) => setSettings({ ...settings, workDuration: parseInt(e.target.value) || 25 })}
        min="1"
        max="180"
      />
      
      <FormField
        label="Short Break (minutes)"
        type="number"
        value={settings.breakDuration}
        onChange={(e) => setSettings({ ...settings, breakDuration: parseInt(e.target.value) || 5 })}
        min="1"
        max="60"
      />
      
      <FormField
        label="Long Break (minutes)"
        type="number"
        value={settings.longBreakDuration}
        onChange={(e) => setSettings({ ...settings, longBreakDuration: parseInt(e.target.value) || 15 })}
        min="1"
        max="120"
      />

      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="autoStart"
          checked={settings.autoStart}
          onChange={(e) => setSettings({ ...settings, autoStart: e.target.checked })}
          className="rounded border-gray-300 text-primary focus:ring-primary"
        />
        <label htmlFor="autoStart" className="text-sm text-gray-700">
          Auto-start next session
        </label>
      </div>
    </div>
  );

  const renderNotificationSettings = () => (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="soundNotifications"
          checked={settings.soundNotifications}
          onChange={(e) => setSettings({ ...settings, soundNotifications: e.target.checked })}
          className="rounded border-gray-300 text-primary focus:ring-primary"
        />
        <label htmlFor="soundNotifications" className="text-sm text-gray-700">
          Play notification sounds
        </label>
      </div>

      <div className="p-4 bg-warning/10 rounded-lg border border-warning/20">
        <div className="flex items-center space-x-2 mb-2">
          <ApperIcon name="AlertTriangle" size={16} className="text-warning" />
          <span className="text-sm font-medium text-gray-900">Browser Permissions</span>
        </div>
        <p className="text-sm text-gray-600">
          To receive notifications when you're away, enable browser notifications for this site.
        </p>
        <Button size="sm" variant="secondary" className="mt-2">
          Enable Notifications
        </Button>
      </div>
    </div>
  );

  const renderGoalsSettings = () => (
    <div className="space-y-4">
      <FormField
        label="Weekly Hours Goal"
        type="number"
        value={settings.weeklyGoal}
        onChange={(e) => setSettings({ ...settings, weeklyGoal: parseInt(e.target.value) || 40 })}
        min="1"
        max="168"
      />

      <div className="p-4 bg-info/10 rounded-lg border border-info/20">
        <div className="flex items-center space-x-2 mb-2">
          <ApperIcon name="Target" size={16} className="text-info" />
          <span className="text-sm font-medium text-gray-900">Goal Tracking</span>
        </div>
        <p className="text-sm text-gray-600">
          Set realistic goals based on your schedule. We'll help you stay on track with gentle reminders.
        </p>
      </div>
    </div>
  );

  const renderPrivacySettings = () => (
    <div className="space-y-4">
      <div className="p-4 bg-success/10 rounded-lg border border-success/20">
        <div className="flex items-center space-x-2 mb-2">
          <ApperIcon name="Shield" size={16} className="text-success" />
          <span className="text-sm font-medium text-gray-900">Privacy First</span>
        </div>
        <p className="text-sm text-gray-600">
          All your time tracking data stays on your device. We don't send any personal information to external servers.
        </p>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between p-3 bg-white border rounded-lg">
          <div className="flex items-center space-x-3">
            <ApperIcon name="HardDrive" size={20} className="text-gray-400" />
            <div>
              <p className="text-sm font-medium text-gray-900">Local Storage</p>
              <p className="text-xs text-gray-500">Data stored in your browser</p>
            </div>
          </div>
          <div className="text-success">
            <ApperIcon name="Check" size={16} />
          </div>
        </div>

        <div className="flex items-center justify-between p-3 bg-white border rounded-lg">
          <div className="flex items-center space-x-3">
            <ApperIcon name="CloudOff" size={20} className="text-gray-400" />
            <div>
              <p className="text-sm font-medium text-gray-900">No Cloud Sync</p>
              <p className="text-xs text-gray-500">No data sent to servers</p>
            </div>
          </div>
          <div className="text-success">
            <ApperIcon name="Check" size={16} />
          </div>
        </div>

        <div className="flex items-center justify-between p-3 bg-white border rounded-lg">
          <div className="flex items-center space-x-3">
            <ApperIcon name="Eye" size={20} className="text-gray-400" />
            <div>
              <p className="text-sm font-medium text-gray-900">Content Redaction</p>
              <p className="text-xs text-gray-500">Sensitive URLs automatically hidden</p>
            </div>
          </div>
          <div className="text-success">
            <ApperIcon name="Check" size={16} />
          </div>
        </div>
      </div>

      <Button variant="danger" size="sm" className="w-full">
        <ApperIcon name="Trash2" size={16} className="mr-2" />
        Clear All Data
      </Button>
    </div>
  );

  const renderExportSettings = () => (
    <div className="space-y-4">
      <div className="space-y-1">
        <label className="text-sm font-medium text-gray-900 mb-1.5 block">
          Default Export Format
        </label>
        <select
          value={settings.exportFormat}
          onChange={(e) => setSettings({ ...settings, exportFormat: e.target.value })}
          className="flex w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm"
        >
          <option value="csv">CSV (Excel compatible)</option>
          <option value="json">JSON (Technical format)</option>
          <option value="pdf">PDF (Formatted report)</option>
        </select>
      </div>

      <div className="p-4 bg-primary/10 rounded-lg border border-primary/20">
        <div className="flex items-center space-x-2 mb-2">
          <ApperIcon name="Download" size={16} className="text-primary" />
          <span className="text-sm font-medium text-gray-900">Export Features</span>
        </div>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• Time entries with project and tag information</li>
          <li>• Billable vs non-billable breakdowns</li>
          <li>• Date range filtering</li>
          <li>• Invoice-ready formatting</li>
        </ul>
</div>
    </div>
  );

  const renderCalendarSyncSettings = () => (
    <div className="space-y-4">
      <div className="p-4 bg-info/10 rounded-lg border border-info/20">
        <div className="flex items-center space-x-2 mb-2">
          <ApperIcon name="Calendar" size={16} className="text-info" />
          <span className="text-sm font-medium text-gray-900">Calendar Integration</span>
</div>
        <p className="text-sm text-gray-600">
          Automatically import your meeting schedule to avoid conflicts with your focused work time.
        </p>
      </div>
      <div className="space-y-4">
        <h4 className="text-sm font-medium text-gray-900 mb-3">Calendar Providers</h4>
        
        {/* Google Calendar */}
        <div className="flex items-center justify-between p-4 bg-white border rounded-lg">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
              <ApperIcon name="Calendar" size={16} className="text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">Google Calendar</p>
              <p className="text-xs text-gray-500">
                {settings.googleCalendarEnabled ? "Connected" : "Not connected"}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {settings.googleCalendarEnabled && (
              <div className="text-success">
                <ApperIcon name="Check" size={16} />
              </div>
            )}
            <Button 
              size="sm" 
              variant={settings.googleCalendarEnabled ? "secondary" : "primary"}
              onClick={() => setSettings({ 
                ...settings, 
                googleCalendarEnabled: !settings.googleCalendarEnabled 
              })}
            >
              {settings.googleCalendarEnabled ? "Disconnect" : "Connect"}
            </Button>
          </div>
        </div>

        {/* Outlook Calendar */}
        <div className="flex items-center justify-between p-4 bg-white border rounded-lg">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
              <ApperIcon name="Calendar" size={16} className="text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">Outlook Calendar</p>
              <p className="text-xs text-gray-500">
                {settings.outlookCalendarEnabled ? "Connected" : "Not connected"}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {settings.outlookCalendarEnabled && (
              <div className="text-success">
                <ApperIcon name="Check" size={16} />
              </div>
            )}
            <Button 
              size="sm" 
              variant={settings.outlookCalendarEnabled ? "secondary" : "primary"}
              onClick={() => setSettings({ 
                ...settings, 
                outlookCalendarEnabled: !settings.outlookCalendarEnabled 
              })}
            >
              {settings.outlookCalendarEnabled ? "Disconnect" : "Connect"}
            </Button>
          </div>
        </div>

        {/* Apple Calendar */}
        <div className="flex items-center justify-between p-4 bg-white border rounded-lg">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center">
              <ApperIcon name="Calendar" size={16} className="text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">Apple Calendar</p>
              <p className="text-xs text-gray-500">
                {settings.appleCalendarEnabled ? "Connected" : "Not connected"}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {settings.appleCalendarEnabled && (
              <div className="text-success">
                <ApperIcon name="Check" size={16} />
              </div>
            )}
            <Button 
              size="sm" 
              variant={settings.appleCalendarEnabled ? "secondary" : "primary"}
              onClick={() => setSettings({ 
                ...settings, 
                appleCalendarEnabled: !settings.appleCalendarEnabled 
              })}
            >
              {settings.appleCalendarEnabled ? "Disconnect" : "Connect"}
            </Button>
          </div>
        </div>
      </div>

      {/* Import Settings */}
      {(settings.googleCalendarEnabled || settings.outlookCalendarEnabled || settings.appleCalendarEnabled) && (
        <div className="space-y-4 pt-4 border-t">
          <h4 className="text-sm font-medium text-gray-900">Import Preferences</h4>
          
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="autoImportMeetings"
              checked={settings.autoImportMeetings}
              onChange={(e) => setSettings({ ...settings, autoImportMeetings: e.target.checked })}
              className="rounded border-gray-300 text-primary focus:ring-primary"
/>
            <label htmlFor="autoImportMeetings" className="text-sm text-gray-700">
              Automatically import meetings as "busy" time
            </label>
          </div>
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="includePersonalMeetings"
              checked={settings.includePersonalMeetings}
              onChange={(e) => setSettings({ ...settings, includePersonalMeetings: e.target.checked })}
              className="rounded border-gray-300 text-primary focus:ring-primary"
            />
            <label htmlFor="includePersonalMeetings" className="text-sm text-gray-700">
              Include personal meetings (marked as "Busy")
            </label>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-900 mb-1.5 block">
              Sync Frequency
            </label>
            <select
              value={settings.syncFrequency}
              onChange={(e) => setSettings({ ...settings, syncFrequency: e.target.value })}
              className="flex w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm"
            >
              <option value="realtime">Real-time (when possible)</option>
              <option value="hourly">Every hour</option>
              <option value="daily">Daily</option>
              <option value="manual">Manual only</option>
            </select>
          </div>

          <div className="p-4 bg-warning/10 rounded-lg border border-warning/20">
            <div className="flex items-center space-x-2 mb-2">
              <ApperIcon name="Shield" size={16} className="text-warning" />
              <span className="text-sm font-medium text-gray-900">Privacy Notice</span>
            </div>
            <p className="text-sm text-gray-600">
              Only meeting times and availability status are imported. Meeting details, attendees, and content remain private and are never accessed or stored.
            </p>
          </div>
        </div>
      )}
</div>
  );

  const renderContent = () => {
    switch (activeSection) {
      case "pomodoro":
        return renderPomodoroSettings();
      case "notifications":
        return renderNotificationSettings();
      case "goals":
        return renderGoalsSettings();
      case "privacy":
        return renderPrivacySettings();
      case "export":
        return renderExportSettings();
      case "calendar":
        return renderCalendarSyncSettings();
      default:
        return renderPomodoroSettings();
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 font-display">Settings</h1>
        <p className="text-gray-600">Customize your time tracking experience</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <Card className="p-4 lg:col-span-1">
          <nav className="space-y-1">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-all ${
                  activeSection === section.id
                    ? "bg-gradient-to-r from-primary to-secondary text-white"
                    : "text-gray-700 hover:bg-surface hover:text-primary"
                }`}
              >
                <ApperIcon name={section.icon} size={20} />
                <span className="text-sm font-medium">{section.label}</span>
              </button>
            ))}
          </nav>
        </Card>

        <Card className="p-6 lg:col-span-3">
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 font-display mb-4">
                {sections.find(s => s.id === activeSection)?.label}
              </h2>
              
              {renderContent()}
            </div>

            <div className="flex justify-between pt-6 border-t border-gray-200">
              <Button variant="secondary" onClick={handleReset}>
                <ApperIcon name="RotateCcw" size={16} className="mr-2" />
                Reset to Default
              </Button>
              
              <Button onClick={handleSave}>
                <ApperIcon name="Save" size={16} className="mr-2" />
                Save Settings
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Settings;