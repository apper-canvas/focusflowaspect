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
  const billableWeekHours = Math.round(stats.billable / 3600 * 10) / 10;

  // Enhanced progress calculations
  const dailyProgress = Math.min((todayHours / goals.daily.workHours) * 100, 100);
  const weeklyProgress = Math.min((billableWeekHours / goals.weekly.billableHours) * 100, 100);
  const focusSessionsProgress = goals.daily.focusSessions ? Math.min((Math.ceil(todayHours / 2) / goals.daily.focusSessions) * 100, 100) : 0;

  const getProgressColor = (progress) => {
    if (progress >= 100) return 'text-success';
    if (progress >= 80) return 'text-primary';
    if (progress >= 60) return 'text-info';
    if (progress >= 40) return 'text-warning';
    return 'text-error';
  };

  const getProgressBgColor = (progress) => {
    if (progress >= 100) return 'from-success/15 to-success/8';
    if (progress >= 80) return 'from-primary/15 to-primary/8';
    if (progress >= 60) return 'from-info/15 to-info/8';
    if (progress >= 40) return 'from-warning/15 to-warning/8';
    return 'from-error/15 to-error/8';
  };

  const getProgressStatus = (progress, target, current) => {
    const remaining = Math.max(target - current, 0);
    if (progress >= 100) return { message: "Goal achieved! 🎉", color: "text-success" };
    if (progress >= 80) return { message: `${remaining.toFixed(1)}h to go - excellent pace!`, color: "text-primary" };
    if (progress >= 60) return { message: `${remaining.toFixed(1)}h remaining - on track`, color: "text-info" };
    if (progress >= 40) return { message: `${remaining.toFixed(1)}h left - needs focus`, color: "text-warning" };
    return { message: `${remaining.toFixed(1)}h behind - action needed`, color: "text-error" };
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {/* Enhanced Daily Goal Progress */}
      <Card className={`p-5 bg-gradient-to-br ${getProgressBgColor(dailyProgress)} border-l-4 border-l-primary relative overflow-hidden`}>
        <div className="absolute top-0 right-0 w-20 h-20 bg-primary/5 rounded-full -mr-10 -mt-10" />
        <div className="relative">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-primary/10 rounded-lg">
                <ApperIcon name="Sun" size={18} className="text-primary" />
              </div>
              <div>
                <span className="text-sm font-semibold text-gray-900">Daily Goal</span>
                <p className="text-xs text-gray-600">Work Hours Target</p>
              </div>
            </div>
            <div className="text-right">
              <span className={`text-lg font-bold ${getProgressColor(dailyProgress)}`}>
                {Math.round(dailyProgress)}%
              </span>
              <p className="text-xs text-gray-500">Complete</p>
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-700 font-medium">Progress</span>
              <span className="font-bold text-gray-900">{todayHours}h / {goals.daily.workHours}h</span>
            </div>
            
            <div className="relative">
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className="bg-gradient-to-r from-primary via-primary to-secondary h-3 rounded-full transition-all duration-700 ease-out relative overflow-hidden"
                  style={{ width: `${Math.min(dailyProgress, 100)}%` }}
                >
                  <div className="absolute inset-0 bg-white/20 animate-pulse" />
                </div>
              </div>
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>0h</span>
                <span>{goals.daily.workHours}h</span>
              </div>
            </div>

            <div className="mt-3 p-2 bg-white/60 rounded-lg">
              <p className={`text-xs font-medium ${getProgressStatus(dailyProgress, goals.daily.workHours, todayHours).color}`}>
                {getProgressStatus(dailyProgress, goals.daily.workHours, todayHours).message}
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Enhanced Weekly Goal Progress */}
      <Card className={`p-5 bg-gradient-to-br ${getProgressBgColor(weeklyProgress)} border-l-4 border-l-success relative overflow-hidden`}>
        <div className="absolute top-0 right-0 w-20 h-20 bg-success/5 rounded-full -mr-10 -mt-10" />
        <div className="relative">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-success/10 rounded-lg">
                <ApperIcon name="Calendar" size={18} className="text-success" />
              </div>
              <div>
                <span className="text-sm font-semibold text-gray-900">Weekly Goal</span>
                <p className="text-xs text-gray-600">Billable Hours</p>
              </div>
            </div>
            <div className="text-right">
              <span className={`text-lg font-bold ${getProgressColor(weeklyProgress)}`}>
                {Math.round(weeklyProgress)}%
              </span>
              <p className="text-xs text-gray-500">Complete</p>
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-700 font-medium">Progress</span>
              <span className="font-bold text-gray-900">{billableWeekHours}h / {goals.weekly.billableHours}h</span>
            </div>
            
            <div className="relative">
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className="bg-gradient-to-r from-success via-success to-success/80 h-3 rounded-full transition-all duration-700 ease-out relative overflow-hidden"
                  style={{ width: `${Math.min(weeklyProgress, 100)}%` }}
                >
                  <div className="absolute inset-0 bg-white/20 animate-pulse" />
                </div>
              </div>
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>0h</span>
                <span>{goals.weekly.billableHours}h</span>
              </div>
            </div>

            <div className="mt-3 p-2 bg-white/60 rounded-lg">
              <p className={`text-xs font-medium ${getProgressStatus(weeklyProgress, goals.weekly.billableHours, billableWeekHours).color}`}>
                {getProgressStatus(weeklyProgress, goals.weekly.billableHours, billableWeekHours).message}
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Enhanced Focus Sessions Goal */}
      <Card className={`p-5 bg-gradient-to-br ${getProgressBgColor(focusSessionsProgress)} border-l-4 border-l-info relative overflow-hidden`}>
        <div className="absolute top-0 right-0 w-20 h-20 bg-info/5 rounded-full -mr-10 -mt-10" />
        <div className="relative">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-info/10 rounded-lg">
                <ApperIcon name="Target" size={18} className="text-info" />
              </div>
              <div>
                <span className="text-sm font-semibold text-gray-900">Focus Sessions</span>
                <p className="text-xs text-gray-600">Daily Target</p>
              </div>
            </div>
            <div className="text-right">
              <span className={`text-lg font-bold ${getProgressColor(focusSessionsProgress)}`}>
                {Math.round(focusSessionsProgress)}%
              </span>
              <p className="text-xs text-gray-500">Complete</p>
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-700 font-medium">Sessions</span>
              <span className="font-bold text-gray-900">{Math.ceil(todayHours / 2)} / {goals.daily.focusSessions}</span>
            </div>
            
            <div className="relative">
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className="bg-gradient-to-r from-info via-info to-info/80 h-3 rounded-full transition-all duration-700 ease-out relative overflow-hidden"
                  style={{ width: `${Math.min(focusSessionsProgress, 100)}%` }}
                >
                  <div className="absolute inset-0 bg-white/20 animate-pulse" />
                </div>
              </div>
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>0</span>
                <span>{goals.daily.focusSessions}</span>
              </div>
            </div>

            <div className="mt-3 p-2 bg-white/60 rounded-lg">
              <p className={`text-xs font-medium ${getProgressColor(focusSessionsProgress)}`}>
                {Math.ceil(todayHours / 2) >= goals.daily.focusSessions 
                  ? "Daily sessions completed! 🎯" 
                  : `${Math.max(goals.daily.focusSessions - Math.ceil(todayHours / 2), 0)} sessions remaining`}
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Enhanced Project Goals - Show all projects if available */}
      {goals.projects && goals.projects.length > 0 && 
        goals.projects.slice(0, 3).map((project, index) => {
          const projectProgress = Math.min((weekHours / project.weeklyTarget) * 100, 100);
          const priorityColor = project.priority === 'high' ? 'error' : project.priority === 'medium' ? 'warning' : 'success';
          
          return (
            <Card key={project.id || index} className={`p-5 bg-gradient-to-br ${getProgressBgColor(projectProgress)} border-l-4 border-l-${priorityColor} relative overflow-hidden`}>
              <div className={`absolute top-0 right-0 w-20 h-20 bg-${priorityColor}/5 rounded-full -mr-10 -mt-10`} />
              <div className="relative">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <div className={`p-2 bg-${priorityColor}/10 rounded-lg`}>
                      <ApperIcon name="Briefcase" size={18} className={`text-${priorityColor}`} />
                    </div>
                    <div className="flex-1">
                      <span className="text-sm font-semibold text-gray-900 block truncate" title={project.name}>
                        {project.name}
                      </span>
                      <p className="text-xs text-gray-600 capitalize">{project.priority} Priority</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`text-lg font-bold ${getProgressColor(projectProgress)}`}>
                      {Math.round(projectProgress)}%
                    </span>
                    <p className="text-xs text-gray-500">Weekly</p>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-700 font-medium">Progress</span>
                    <span className="font-bold text-gray-900">{weekHours}h / {project.weeklyTarget}h</span>
                  </div>
                  
                  <div className="relative">
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div 
                        className={`bg-gradient-to-r from-${priorityColor} via-${priorityColor} to-${priorityColor}/80 h-3 rounded-full transition-all duration-700 ease-out relative overflow-hidden`}
                        style={{ width: `${Math.min(projectProgress, 100)}%` }}
                      >
                        <div className="absolute inset-0 bg-white/20 animate-pulse" />
                      </div>
                    </div>
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>0h</span>
                      <span>{project.weeklyTarget}h</span>
                    </div>
                  </div>

                  <div className="mt-3 p-2 bg-white/60 rounded-lg">
                    <p className={`text-xs font-medium ${getProgressStatus(projectProgress, project.weeklyTarget, weekHours).color}`}>
                      {getProgressStatus(projectProgress, project.weeklyTarget, weekHours).message}
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          );
        })
      }
    </div>
  );
};

export default Dashboard;