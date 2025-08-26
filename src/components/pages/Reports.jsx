import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { formatDate, getTodayStart, getWeekStart } from "@/utils/timeUtils";
import ApperIcon from "@/components/ApperIcon";
import Card from "@/components/atoms/Card";
import Button from "@/components/atoms/Button";
import Projects from "@/components/pages/Projects";
import ReportsPanel from "@/components/organisms/ReportsPanel";

const Reports = () => {
  const navigate = useNavigate();
  const [dateRange, setDateRange] = useState("week");
  const [exportFormat, setExportFormat] = useState("csv");

  const dateRangeOptions = [
    { value: "today", label: "Today" },
    { value: "week", label: "This Week" },
    { value: "month", label: "This Month" },
    { value: "quarter", label: "This Quarter" },
    { value: "year", label: "This Year" }
  ];

  const exportOptions = [
    { value: "csv", label: "CSV", icon: "FileText" },
    { value: "excel", label: "Excel", icon: "FileSpreadsheet" },
    { value: "pdf", label: "PDF", icon: "FileImage" }
  ];

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 font-display">Time Reports</h1>
          <p className="text-gray-600">Analyze your productivity and time allocation</p>
        </div>
        
        <div className="flex items-center space-x-3">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-primary"
          >
            {dateRangeOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          
          <Button variant="secondary" size="sm">
            <ApperIcon name="Download" size={16} className="mr-1" />
            Export
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ReportsPanel />
        </div>
        
<div className="space-y-6">
          {/* Goal Progress Display Component */}
          <GoalProgressDisplay />
        </div>
      </div>
    </div>
  );
};

// Goal Progress Display Component for Reports Page
const GoalProgressDisplay = () => {
  const [goals, setGoals] = useState(null);
  const [stats, setStats] = useState({ today: 0, week: 0, billable: 0 });

  useEffect(() => {
    const savedGoals = localStorage.getItem("focusflow-goals");
    if (savedGoals) {
      setGoals(JSON.parse(savedGoals));
    }
    loadCurrentStats();
  }, []);

  const loadCurrentStats = async () => {
    try {
      const { timeEntryService } = await import("@/services/api/timeEntryService");
      const { getTodayStart, getWeekStart } = await import("@/utils/timeUtils");
      
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

      setStats({ today: todayTime, week: weekTime, billable: billableTime });
    } catch (error) {
      console.error("Failed to load current stats:", error);
    }
  };

  if (!goals) {
    return (
      <Card className="p-6">
        <div className="text-center py-8">
          <ApperIcon name="Target" size={48} className="mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Goals Set</h3>
          <p className="text-gray-600 mb-4">Set up your productivity goals to track progress</p>
          <Button onClick={() => navigate('/goals')}>
            <ApperIcon name="Plus" size={16} className="mr-2" />
            Create Goals
          </Button>
        </div>
      </Card>
    );
  }

  const todayHours = Math.round(stats.today / 3600 * 10) / 10;
  const weekHours = Math.round(stats.week / 3600 * 10) / 10;
  const billableWeekHours = Math.round(stats.billable / 3600 * 10) / 10;

  const dailyProgress = Math.min((todayHours / goals.daily.workHours) * 100, 100);
  const weeklyProgress = Math.min((billableWeekHours / goals.weekly.billableHours) * 100, 100);
  const focusSessionsProgress = Math.min((Math.ceil(todayHours / 2) / goals.daily.focusSessions) * 100, 100);

  const getProgressColor = (progress) => {
    if (progress >= 100) return 'success';
    if (progress >= 80) return 'primary';
    if (progress >= 60) return 'info';
    if (progress >= 40) return 'warning';
    return 'error';
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 font-display">
          Goal Progress Tracking
        </h3>
        <Button 
          size="sm" 
          variant="secondary"
          onClick={() => navigate('/goals')}
        >
          <ApperIcon name="Settings" size={16} className="mr-2" />
          Manage Goals
        </Button>
      </div>
      
      <div className="space-y-6">
        {/* Daily Goals Section */}
        <div>
          <h4 className="font-semibold text-gray-800 mb-4 flex items-center">
            <ApperIcon name="Sun" size={16} className="mr-2 text-warning" />
            Daily Goals Progress
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className={`p-4 bg-gradient-to-r from-${getProgressColor(dailyProgress)}/5 to-${getProgressColor(dailyProgress)}/10 rounded-lg border border-${getProgressColor(dailyProgress)}/20`}>
              <div className="flex justify-between text-sm mb-2">
                <span className="font-medium">Work Hours</span>
                <span className="text-gray-600">{todayHours}h / {goals.daily.workHours}h</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
                <div 
                  className={`bg-gradient-to-r from-${getProgressColor(dailyProgress)} to-${getProgressColor(dailyProgress)}/80 h-3 rounded-full transition-all duration-700`}
                  style={{ width: `${Math.min(dailyProgress, 100)}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-gray-500">
                <span>{Math.round(dailyProgress)}% Complete</span>
                <span>{Math.max(goals.daily.workHours - todayHours, 0).toFixed(1)}h remaining</span>
              </div>
            </div>
            
            <div className={`p-4 bg-gradient-to-r from-${getProgressColor(focusSessionsProgress)}/5 to-${getProgressColor(focusSessionsProgress)}/10 rounded-lg border border-${getProgressColor(focusSessionsProgress)}/20`}>
              <div className="flex justify-between text-sm mb-2">
                <span className="font-medium">Focus Sessions</span>
                <span className="text-gray-600">{Math.ceil(todayHours / 2)} / {goals.daily.focusSessions}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
                <div 
                  className={`bg-gradient-to-r from-${getProgressColor(focusSessionsProgress)} to-${getProgressColor(focusSessionsProgress)}/80 h-3 rounded-full transition-all duration-700`}
                  style={{ width: `${Math.min(focusSessionsProgress, 100)}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-gray-500">
                <span>{Math.round(focusSessionsProgress)}% Complete</span>
                <span>{Math.max(goals.daily.focusSessions - Math.ceil(todayHours / 2), 0)} sessions left</span>
              </div>
            </div>
          </div>
        </div>

        {/* Weekly Goals Section */}
        <div>
          <h4 className="font-semibold text-gray-800 mb-4 flex items-center">
            <ApperIcon name="Calendar" size={16} className="mr-2 text-primary" />
            Weekly Goals Progress
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className={`p-4 bg-gradient-to-r from-${getProgressColor(weeklyProgress)}/5 to-${getProgressColor(weeklyProgress)}/10 rounded-lg border border-${getProgressColor(weeklyProgress)}/20`}>
              <div className="flex justify-between text-sm mb-2">
                <span className="font-medium">Billable Hours</span>
                <span className="text-gray-600">{billableWeekHours}h / {goals.weekly.billableHours}h</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
                <div 
                  className={`bg-gradient-to-r from-${getProgressColor(weeklyProgress)} to-${getProgressColor(weeklyProgress)}/80 h-3 rounded-full transition-all duration-700`}
                  style={{ width: `${Math.min(weeklyProgress, 100)}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-gray-500">
                <span>{Math.round(weeklyProgress)}% Complete</span>
                <span>{Math.max(goals.weekly.billableHours - billableWeekHours, 0).toFixed(1)}h remaining</span>
              </div>
            </div>

            {goals.weekly.learningHours && (
              <div className="p-4 bg-gradient-to-r from-info/5 to-info/10 rounded-lg border border-info/20">
                <div className="flex justify-between text-sm mb-2">
                  <span className="font-medium">Learning Time</span>
                  <span className="text-gray-600">0h / {goals.weekly.learningHours}h</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
                  <div 
                    className="bg-gradient-to-r from-info to-info/80 h-3 rounded-full transition-all duration-700"
                    style={{ width: "0%" }}
                  />
                </div>
                <div className="flex justify-between text-xs text-gray-500">
                  <span>0% Complete</span>
                  <span>{goals.weekly.learningHours}h remaining</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Project Goals Section */}
        {goals.projects && goals.projects.length > 0 && (
          <div>
            <h4 className="font-semibold text-gray-800 mb-4 flex items-center">
              <ApperIcon name="Target" size={16} className="mr-2 text-secondary" />
              Project Goals Progress
            </h4>
            <div className="space-y-3">
              {goals.projects.map((project, index) => {
                const projectProgress = Math.min((weekHours / project.weeklyTarget) * 100, 100);
                const priorityColor = project.priority === 'high' ? 'error' : project.priority === 'medium' ? 'warning' : 'success';
                
                return (
                  <div key={project.id || index} className={`p-4 bg-gradient-to-r from-${priorityColor}/5 to-${priorityColor}/10 rounded-lg border border-${priorityColor}/20`}>
                    <div className="flex justify-between text-sm mb-2">
                      <div className="flex items-center space-x-2">
                        <div className={`w-2 h-2 rounded-full bg-${priorityColor}`} />
                        <span className="font-medium">{project.name}</span>
                        <span className="text-xs text-gray-500 capitalize">({project.priority} priority)</span>
                      </div>
                      <span className="text-gray-600">{weekHours.toFixed(1)}h / {project.weeklyTarget}h</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
                      <div 
                        className={`bg-gradient-to-r from-${priorityColor} to-${priorityColor}/80 h-3 rounded-full transition-all duration-700`}
                        style={{ width: `${Math.min(projectProgress, 100)}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>{Math.round(projectProgress)}% Complete</span>
                      <span>{Math.max(project.weeklyTarget - weekHours, 0).toFixed(1)}h remaining this week</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Goal Achievement Summary */}
        <div className="p-4 bg-gradient-to-r from-success/10 to-primary/10 rounded-lg border border-success/20">
          <h5 className="font-medium text-gray-800 mb-3 flex items-center">
            <ApperIcon name="TrendingUp" size={16} className="mr-2 text-success" />
            Weekly Achievement Summary
          </h5>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className={`text-2xl font-bold ${dailyProgress >= 80 ? 'text-success' : 'text-warning'}`}>
                {Math.round(dailyProgress)}%
              </div>
              <div className="text-xs text-gray-600">Daily Goal</div>
            </div>
            <div>
              <div className={`text-2xl font-bold ${weeklyProgress >= 80 ? 'text-success' : 'text-warning'}`}>
                {Math.round(weeklyProgress)}%
              </div>
              <div className="text-xs text-gray-600">Weekly Goal</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-info">
                {goals.projects ? goals.projects.length : 0}
              </div>
              <div className="text-xs text-gray-600">Active Projects</div>
            </div>
</div>
        </div>
      </div>
    </Card>

    {/* Achievement Dashboard */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 font-display mb-4">
              Achievements & Insights
            </h3>
            
            <div className="space-y-4">
              <div className="flex items-center space-x-3 p-3 bg-gradient-to-r from-success/10 to-success/5 rounded-lg border border-success/20">
                <div className="p-2 bg-success rounded-full">
                  <ApperIcon name="Trophy" size={20} className="text-white" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">Goal Achieved!</p>
                  <p className="text-sm text-gray-600">Completed daily focus sessions streak (7 days)</p>
                </div>
                <div className="text-xs text-success font-bold">+10 XP</div>
              </div>
              
              <div className="flex items-center space-x-3 p-3 bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg">
                <div className="p-2 bg-primary rounded-full">
                  <ApperIcon name="TrendingUp" size={20} className="text-white" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Productivity Up 23%</p>
                  <p className="text-sm text-gray-600">Compared to last week</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 p-3 bg-gradient-to-r from-warning/10 to-warning/5 rounded-lg">
                <div className="p-2 bg-warning rounded-full">
                  <ApperIcon name="Clock" size={20} className="text-white" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Best Session Today</p>
                  <p className="text-sm text-gray-600">2h 45m on FocusFlow Development</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 p-3 bg-gradient-to-r from-info/10 to-info/5 rounded-lg">
                <div className="p-2 bg-info rounded-full">
                  <ApperIcon name="Zap" size={20} className="text-white" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Peak Hours</p>
                  <p className="text-sm text-gray-600">Most productive: 9 AM - 11 AM</p>
                </div>
              </div>
            </div>
            
            {/* Weekly Progress Summary */}
            <div className="mt-6 p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg">
              <h4 className="font-semibold text-gray-800 mb-3">This Week's Progress</h4>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-success">85%</div>
                  <div className="text-xs text-gray-600">Goals Met</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-primary">42.5h</div>
                  <div className="text-xs text-gray-600">Total Time</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-secondary">12</div>
                  <div className="text-xs text-gray-600">Sessions</div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Reports;