import React, { useEffect, useState } from "react";
import { timeEntryService } from "@/services/api/timeEntryService";
import { getTodayStart, getWeekStart } from "@/utils/timeUtils";
import ApperIcon from "@/components/ApperIcon";
import PomodoroTimer from "@/components/molecules/PomodoroTimer";
import QuickStats from "@/components/molecules/QuickStats";
import Card from "@/components/atoms/Card";
import TimerControl from "@/components/organisms/TimerControl";
import ActivityFeed from "@/components/organisms/ActivityFeed";
import TimelineView from "@/components/organisms/TimelineView";
const Dashboard = () => {
  const [refreshKey, setRefreshKey] = useState(0);
  const [stats, setStats] = useState({
    today: 0,
    week: 0,
    billable: 0,
    activeProjects: 0
  });

  useEffect(() => {
    loadStats();
  }, [refreshKey]);

  const loadStats = async () => {
    try {
      const allEntries = await timeEntryService.getAll();
      const todayStart = getTodayStart();
      const weekStart = getWeekStart();

const todayEntries = allEntries.filter(entry => entry.startTime >= todayStart);
      const weekEntries = allEntries.filter(entry => entry.startTime >= weekStart);
      
      const todayTime = todayEntries.reduce((sum, entry) => sum + (entry.duration || 0), 0);
      const weekTime = weekEntries.reduce((sum, entry) => sum + (entry.duration || 0), 0);
      const billableTime = weekEntries
        .filter(entry => entry.billable)
        .reduce((sum, entry) => sum + (entry.duration || 0), 0);

      const activeProjects = new Set(
        weekEntries.map(entry => entry.project).filter(Boolean)
      ).size;

      setStats({
        today: todayTime,
        week: weekTime,
        billable: billableTime,
        activeProjects
      });
    } catch (error) {
      console.error("Failed to load stats:", error);
    }
  };

  const handleEntryCreated = () => {
    setRefreshKey(prev => prev + 1);
  };

return (
    <div className="w-full">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 font-display">Dashboard</h1>
        <p className="text-gray-600">Track your time with AI-powered precision and achieve your goals</p>
      </div>

      <QuickStats stats={stats} />
      
      {/* Goal Progress Section */}
      <div className="mb-6">
        <GoalProgressCards stats={stats} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-6">
          <TimerControl onEntryCreated={handleEntryCreated} />
          
          <TimelineView refresh={refreshKey} />
        </div>

        <div className="space-y-6">
          <PomodoroTimer onSessionComplete={handleEntryCreated} />
          
          <ActivityFeed onEntryCreated={handleEntryCreated} />
        </div>
      </div>
    </div>
  );
};

// Goal Progress Cards Component
const GoalProgressCards = ({ stats }) => {
  const [goals, setGoals] = useState(null);

  useEffect(() => {
    const savedGoals = localStorage.getItem("focusflow-goals");
    if (savedGoals) {
      setGoals(JSON.parse(savedGoals));
    }
  }, []);

  if (!goals) return null;

  const todayHours = Math.round(stats.today / 3600 * 10) / 10;
  const weekHours = Math.round(stats.week / 3600 * 10) / 10;

  const dailyProgress = Math.min((todayHours / goals.daily.workHours) * 100, 100);
  const weeklyProgress = Math.min((weekHours / goals.weekly.billableHours) * 100, 100);

  const getProgressColor = (progress) => {
    if (progress >= 100) return 'text-success';
    if (progress >= 75) return 'text-primary';
    if (progress >= 50) return 'text-warning';
    return 'text-error';
  };

  const getProgressBgColor = (progress) => {
    if (progress >= 100) return 'from-success/10 to-success/5';
    if (progress >= 75) return 'from-primary/10 to-primary/5';
    if (progress >= 50) return 'from-warning/10 to-warning/5';
    return 'from-error/10 to-error/5';
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {/* Daily Goal Progress */}
      <Card className={`p-4 bg-gradient-to-br ${getProgressBgColor(dailyProgress)} border-l-4 border-l-primary`}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <ApperIcon name="Sun" size={16} className="text-primary" />
            <span className="text-sm font-medium text-gray-900">Daily Goal</span>
          </div>
          <span className={`text-sm font-bold ${getProgressColor(dailyProgress)}`}>
            {Math.round(dailyProgress)}%
          </span>
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Work Hours</span>
            <span className="font-medium">{todayHours}h / {goals.daily.workHours}h</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-primary to-secondary h-2 rounded-full transition-all duration-500"
              style={{ width: `${dailyProgress}%` }}
            />
          </div>
        </div>
      </Card>

      {/* Weekly Goal Progress */}
      <Card className={`p-4 bg-gradient-to-br ${getProgressBgColor(weeklyProgress)} border-l-4 border-l-success`}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <ApperIcon name="Calendar" size={16} className="text-success" />
            <span className="text-sm font-medium text-gray-900">Weekly Goal</span>
          </div>
          <span className={`text-sm font-bold ${getProgressColor(weeklyProgress)}`}>
            {Math.round(weeklyProgress)}%
          </span>
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Billable Hours</span>
            <span className="font-medium">{weekHours}h / {goals.weekly.billableHours}h</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-success to-success/80 h-2 rounded-full transition-all duration-500"
              style={{ width: `${weeklyProgress}%` }}
            />
          </div>
        </div>
      </Card>

      {/* Project Goals */}
      {goals.projects && goals.projects.length > 0 && (
        <Card className="p-4 bg-gradient-to-br from-info/10 to-info/5 border-l-4 border-l-info">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <ApperIcon name="Target" size={16} className="text-info" />
              <span className="text-sm font-medium text-gray-900">Project Goals</span>
            </div>
            <span className="text-sm font-bold text-info">
              {goals.projects.length} active
            </span>
          </div>
          
          <div className="space-y-2">
            {goals.projects.slice(0, 2).map((project, index) => {
              const projectProgress = Math.min((weekHours / project.weeklyTarget) * 100, 100);
              return (
                <div key={index} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-600 truncate">{project.name}</span>
                    <span className="font-medium">{Math.round(projectProgress)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1">
                    <div 
                      className="bg-gradient-to-r from-info to-info/80 h-1 rounded-full transition-all duration-500"
                      style={{ width: `${projectProgress}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}
    </div>
  );
};

export default Dashboard;