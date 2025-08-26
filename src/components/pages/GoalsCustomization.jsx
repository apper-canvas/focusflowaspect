import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import ApperIcon from "@/components/ApperIcon";
import FormField from "@/components/molecules/FormField";
import Card from "@/components/atoms/Card";
import Button from "@/components/atoms/Button";

const GoalsCustomization = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("daily");
  const [goals, setGoals] = useState({
    daily: {
      workHours: 8,
      focusSessions: 5,
      breakTime: 60,
      learningTime: 60
    },
    weekly: {
      billableHours: 40,
      learningHours: 5,
      meetingHours: 10,
      projectHours: 25
    },
    projects: [
      { id: 1, name: "FocusFlow Development", weeklyTarget: 25, priority: "high" },
      { id: 2, name: "Client Work", weeklyTarget: 15, priority: "medium" }
    ],
    notifications: {
      dailyReminders: true,
      weeklyProgress: true,
      goalAchieved: true,
      behindTarget: true
    }
  });

  const [newProject, setNewProject] = useState({
    name: "",
    weeklyTarget: 10,
    priority: "medium"
  });

  const tabs = [
    { id: "daily", label: "Daily Goals", icon: "Sun" },
    { id: "weekly", label: "Weekly Goals", icon: "Calendar" },
    { id: "projects", label: "Project Goals", icon: "Target" },
    { id: "notifications", label: "Notifications", icon: "Bell" }
  ];

  const priorityOptions = [
    { value: "high", label: "High Priority", color: "error" },
    { value: "medium", label: "Medium Priority", color: "warning" },
    { value: "low", label: "Low Priority", color: "success" }
  ];

  const handleSave = async () => {
    try {
      localStorage.setItem("focusflow-goals", JSON.stringify(goals));
      toast.success("Goals saved successfully!");
      navigate("/reports");
    } catch (error) {
      toast.error("Failed to save goals");
      console.error("Save goals error:", error);
    }
  };

  const handleAddProject = () => {
    if (!newProject.name.trim()) {
      toast.error("Please enter a project name");
      return;
    }

    const projectGoal = {
      id: Date.now(),
      ...newProject,
      weeklyTarget: parseInt(newProject.weeklyTarget) || 10
    };

    setGoals({
      ...goals,
      projects: [...goals.projects, projectGoal]
    });

    setNewProject({ name: "", weeklyTarget: 10, priority: "medium" });
    toast.success("Project goal added!");
  };

  const handleRemoveProject = (projectId) => {
    setGoals({
      ...goals,
      projects: goals.projects.filter(p => p.id !== projectId)
    });
    toast.info("Project goal removed");
  };

  const updateDailyGoal = (field, value) => {
    setGoals({
      ...goals,
      daily: {
        ...goals.daily,
        [field]: parseInt(value) || 0
      }
    });
  };

  const updateWeeklyGoal = (field, value) => {
    setGoals({
      ...goals,
      weekly: {
        ...goals.weekly,
        [field]: parseInt(value) || 0
      }
    });
  };

  const updateProjectGoal = (projectId, field, value) => {
    setGoals({
      ...goals,
      projects: goals.projects.map(p => 
        p.id === projectId 
          ? { ...p, [field]: field === 'weeklyTarget' ? parseInt(value) || 0 : value }
          : p
      )
    });
  };

  const renderDailyGoals = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField
          label="Daily Work Hours"
          type="number"
          value={goals.daily.workHours}
          onChange={(e) => updateDailyGoal('workHours', e.target.value)}
          min="1"
          max="24"
          helpText="Target hours for productive work"
        />
        
        <FormField
          label="Focus Sessions"
          type="number"
          value={goals.daily.focusSessions}
          onChange={(e) => updateDailyGoal('focusSessions', e.target.value)}
          min="1"
          max="20"
          helpText="Number of focused work sessions"
        />
        
        <FormField
          label="Break Time (minutes)"
          type="number"
          value={goals.daily.breakTime}
          onChange={(e) => updateDailyGoal('breakTime', e.target.value)}
          min="15"
          max="480"
          helpText="Total break time per day"
        />
        
        <FormField
          label="Learning Time (minutes)"
          type="number"
          value={goals.daily.learningTime}
          onChange={(e) => updateDailyGoal('learningTime', e.target.value)}
          min="0"
          max="480"
          helpText="Time dedicated to learning and development"
        />
      </div>

      <div className="p-4 bg-success/10 rounded-lg border border-success/20">
        <div className="flex items-center space-x-2 mb-2">
          <ApperIcon name="Lightbulb" size={16} className="text-success" />
          <span className="text-sm font-medium text-gray-900">Daily Goal Tips</span>
        </div>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• Start with achievable goals and gradually increase</li>
          <li>• Include buffer time for unexpected tasks</li>
          <li>• Balance focused work with adequate breaks</li>
          <li>• Track consistently to identify patterns</li>
        </ul>
      </div>
    </div>
  );

  const renderWeeklyGoals = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField
          label="Billable Hours"
          type="number"
          value={goals.weekly.billableHours}
          onChange={(e) => updateWeeklyGoal('billableHours', e.target.value)}
          min="1"
          max="168"
          helpText="Client work and billable time"
        />
        
        <FormField
          label="Learning Hours"
          type="number"
          value={goals.weekly.learningHours}
          onChange={(e) => updateWeeklyGoal('learningHours', e.target.value)}
          min="0"
          max="40"
          helpText="Skill development and training"
        />
        
        <FormField
          label="Meeting Hours"
          type="number"
          value={goals.weekly.meetingHours}
          onChange={(e) => updateWeeklyGoal('meetingHours', e.target.value)}
          min="0"
          max="40"
          helpText="Scheduled meetings and calls"
        />
        
        <FormField
          label="Project Development Hours"
          type="number"
          value={goals.weekly.projectHours}
          onChange={(e) => updateWeeklyGoal('projectHours', e.target.value)}
          min="0"
          max="60"
          helpText="Time for project work and development"
        />
      </div>

      <div className="p-4 bg-primary/10 rounded-lg border border-primary/20">
        <div className="flex items-center space-x-2 mb-2">
          <ApperIcon name="TrendingUp" size={16} className="text-primary" />
          <span className="text-sm font-medium text-gray-900">Weekly Planning</span>
        </div>
        <p className="text-sm text-gray-600">
          Weekly goals help maintain long-term productivity and ensure balanced time allocation across different work types.
        </p>
      </div>
    </div>
  );

  const renderProjectGoals = () => (
    <div className="space-y-6">
      {/* Existing Project Goals */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Current Project Goals</h3>
        
        {goals.projects.map((project) => (
          <Card key={project.id} className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-3">
                <div className={`w-3 h-3 rounded-full bg-${project.priority === 'high' ? 'error' : project.priority === 'medium' ? 'warning' : 'success'}`}></div>
                <h4 className="font-medium text-gray-900">{project.name}</h4>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => handleRemoveProject(project.id)}
                className="text-error hover:text-error hover:bg-error/10"
              >
                <ApperIcon name="Trash2" size={16} />
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                label="Weekly Target (hours)"
                type="number"
                value={project.weeklyTarget}
                onChange={(e) => updateProjectGoal(project.id, 'weeklyTarget', e.target.value)}
                min="1"
                max="60"
              />
              
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-900 mb-1.5 block">
                  Priority Level
                </label>
                <select
                  value={project.priority}
                  onChange={(e) => updateProjectGoal(project.id, 'priority', e.target.value)}
                  className="flex w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm"
                >
                  {priorityOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Add New Project Goal */}
      <Card className="p-6 border-dashed border-2 border-gray-300 hover:border-primary transition-colors">
        <div className="text-center mb-4">
          <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
            <ApperIcon name="Plus" size={24} className="text-primary" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Add Project Goal</h3>
          <p className="text-gray-600 text-sm">Set time targets for specific projects</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <FormField
            label="Project Name"
            value={newProject.name}
            onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
            placeholder="Enter project name"
          />
          
          <FormField
            label="Weekly Target (hours)"
            type="number"
            value={newProject.weeklyTarget}
            onChange={(e) => setNewProject({ ...newProject, weeklyTarget: e.target.value })}
            min="1"
            max="60"
          />
          
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-900 mb-1.5 block">
              Priority Level
            </label>
            <select
              value={newProject.priority}
              onChange={(e) => setNewProject({ ...newProject, priority: e.target.value })}
              className="flex w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm"
            >
              {priorityOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <Button onClick={handleAddProject} className="w-full">
          <ApperIcon name="Plus" size={16} className="mr-2" />
          Add Project Goal
        </Button>
      </Card>
    </div>
  );

  const renderNotifications = () => (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Goal Notifications</h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-white border rounded-lg">
            <div className="flex items-center space-x-3">
              <ApperIcon name="Sun" size={20} className="text-warning" />
              <div>
                <p className="font-medium text-gray-900">Daily Goal Reminders</p>
                <p className="text-sm text-gray-600">Get notified about daily progress</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={goals.notifications.dailyReminders}
                onChange={(e) => setGoals({
                  ...goals,
                  notifications: { ...goals.notifications, dailyReminders: e.target.checked }
                })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/25 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-4 bg-white border rounded-lg">
            <div className="flex items-center space-x-3">
              <ApperIcon name="Calendar" size={20} className="text-primary" />
              <div>
                <p className="font-medium text-gray-900">Weekly Progress Updates</p>
                <p className="text-sm text-gray-600">Summary of weekly goal achievement</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={goals.notifications.weeklyProgress}
                onChange={(e) => setGoals({
                  ...goals,
                  notifications: { ...goals.notifications, weeklyProgress: e.target.checked }
                })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/25 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-4 bg-white border rounded-lg">
            <div className="flex items-center space-x-3">
              <ApperIcon name="Trophy" size={20} className="text-success" />
              <div>
                <p className="font-medium text-gray-900">Goal Achievement</p>
                <p className="text-sm text-gray-600">Celebrate when goals are completed</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={goals.notifications.goalAchieved}
                onChange={(e) => setGoals({
                  ...goals,
                  notifications: { ...goals.notifications, goalAchieved: e.target.checked }
                })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/25 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-4 bg-white border rounded-lg">
            <div className="flex items-center space-x-3">
              <ApperIcon name="AlertTriangle" size={20} className="text-error" />
              <div>
                <p className="font-medium text-gray-900">Behind Target Alerts</p>
                <p className="text-sm text-gray-600">Get reminded when falling behind goals</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={goals.notifications.behindTarget}
                onChange={(e) => setGoals({
                  ...goals,
                  notifications: { ...goals.notifications, behindTarget: e.target.checked }
                })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/25 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>
        </div>
      </div>

      <div className="p-4 bg-info/10 rounded-lg border border-info/20">
        <div className="flex items-center space-x-2 mb-2">
          <ApperIcon name="Bell" size={16} className="text-info" />
          <span className="text-sm font-medium text-gray-900">Smart Notifications</span>
        </div>
        <p className="text-sm text-gray-600">
          Notifications are designed to motivate and guide, not distract. They respect your focus time and work patterns.
        </p>
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case "daily":
        return renderDailyGoals();
      case "weekly":
        return renderWeeklyGoals();
      case "projects":
        return renderProjectGoals();
      case "notifications":
        return renderNotifications();
      default:
        return renderDailyGoals();
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 font-display">Customize Goals</h1>
          <p className="text-gray-600">Set and manage your productivity targets</p>
        </div>
        
        <Button variant="ghost" onClick={() => navigate("/reports")} className="text-gray-600">
          <ApperIcon name="ArrowLeft" size={16} className="mr-2" />
          Back to Reports
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <Card className="p-4 lg:col-span-1">
          <nav className="space-y-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-all ${
                  activeTab === tab.id
                    ? "bg-gradient-to-r from-primary to-secondary text-white"
                    : "text-gray-700 hover:bg-surface hover:text-primary"
                }`}
              >
                <ApperIcon name={tab.icon} size={20} />
                <span className="text-sm font-medium">{tab.label}</span>
              </button>
            ))}
          </nav>
        </Card>

        <Card className="p-6 lg:col-span-4">
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 font-display mb-4">
                {tabs.find(t => t.id === activeTab)?.label}
              </h2>
              
              {renderTabContent()}
            </div>

            <div className="flex justify-between pt-6 border-t border-gray-200">
              <Button variant="secondary" onClick={() => navigate("/reports")}>
                <ApperIcon name="X" size={16} className="mr-2" />
                Cancel
              </Button>
              
              <Button onClick={handleSave}>
                <ApperIcon name="Save" size={16} className="mr-2" />
                Save Goals
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default GoalsCustomization;