import React from "react";
import ApperIcon from "@/components/ApperIcon";
import FormField from "@/components/molecules/FormField";
import Button from "@/components/atoms/Button";

const renderIdleDetectionSettings = ({ settings, setSettings }) => (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="idleDetectionEnabled"
          checked={settings.idleDetectionEnabled}
          onChange={(e) => setSettings({ ...settings, idleDetectionEnabled: e.target.checked })}
          className="rounded border-gray-300 text-primary focus:ring-primary"
        />
        <label htmlFor="idleDetectionEnabled" className="text-sm text-gray-700">
          Enable idle time detection
        </label>
      </div>

      {settings.idleDetectionEnabled && (
        <div className="space-y-4 pl-6 border-l-2 border-surface">
          <FormField
            label="Detection Threshold (minutes)"
            type="number"
            value={settings.idleDetectionMinutes}
            onChange={(e) => setSettings({ ...settings, idleDetectionMinutes: parseInt(e.target.value) || 5 })}
            min="1"
            max="60"
          />

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-900 mb-1.5 block">
              Custom Prompts
            </label>
            <p className="text-xs text-gray-500 mb-3">
              Random prompts shown when idle time is detected
            </p>
            {settings.idlePrompts.map((prompt, index) => (
              <div key={index} className="flex items-center space-x-2">
                <FormField
                  value={prompt}
                  onChange={(e) => {
                    const newPrompts = [...settings.idlePrompts];
                    newPrompts[index] = e.target.value;
                    setSettings({ ...settings, idlePrompts: newPrompts });
                  }}
                  className="flex-1"
                />
                <Button
                  variant="ghost" 
                  size="sm"
                  onClick={() => {
                    const newPrompts = settings.idlePrompts.filter((_, i) => i !== index);
                    setSettings({ ...settings, idlePrompts: newPrompts });
                  }}
                >
                  <ApperIcon name="X" size={14} />
                </Button>
              </div>
            ))}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSettings({ 
                ...settings, 
                idlePrompts: [...settings.idlePrompts, "New prompt..."] 
              })}
            >
              <ApperIcon name="Plus" size={14} className="mr-1" />
              Add Prompt
            </Button>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="autoIdleCategorization"
              checked={settings.autoIdleCategorization}
              onChange={(e) => setSettings({ ...settings, autoIdleCategorization: e.target.checked })}
              className="rounded border-gray-300 text-primary focus:ring-primary"
            />
            <label htmlFor="autoIdleCategorization" className="text-sm text-gray-700">
              Auto-categorize short idle periods as breaks
            </label>
          </div>
        </div>
      )}

      <div className="p-4 bg-info/10 rounded-lg border border-info/20">
        <div className="flex items-center space-x-2 mb-2">
          <ApperIcon name="Clock" size={16} className="text-info" />
          <span className="text-sm font-medium text-gray-900">How It Works</span>
        </div>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• Monitors mouse, keyboard, and scroll activity</li>
          <li>• Shows popup when idle threshold is reached</li>
          <li>• Helps categorize time for accurate tracking</li>
          <li>• Works only when timer is actively running</li>
        </ul>
      </div>
    </div>
  );