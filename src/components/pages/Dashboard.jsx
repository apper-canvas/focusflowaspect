import React, { useState, useEffect } from "react";
import TimerControl from "@/components/organisms/TimerControl";
import TimelineView from "@/components/organisms/TimelineView";
import ActivityFeed from "@/components/organisms/ActivityFeed";
import QuickStats from "@/components/molecules/QuickStats";
import PomodoroTimer from "@/components/molecules/PomodoroTimer";
import { timeEntryService } from "@/services/api/timeEntryService";
import { getTodayStart, getWeekStart } from "@/utils/timeUtils";
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
        <p className="text-gray-600">Track your time with AI-powered precision</p>
      </div>

      {/* Main Layout Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-6">
          <TimerControl onEntryCreated={handleEntryCreated} />
          
          <TimelineView refresh={refreshKey} />
        </div>
        
        <div className="space-y-6">
          <ActivityFeed onEntryCreated={handleEntryCreated} />
          <PomodoroTimer />
          
          <div className="bg-gradient-to-br from-primary/5 to-secondary/5 p-6 rounded-xl border border-primary/10">
            <h3 className="text-lg font-semibold text-gray-900 font-display mb-4">
              Quick Tips
            </h3>
            <div className="space-y-3 text-sm text-gray-600">
              <div className="flex items-start space-x-2">
                <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                <div>
                  <p className="font-medium text-gray-900">Quick Entry</p>
                  <p>Type "design work 2h #project @tag" and press Ctrl+Enter</p>
                </div>
              </div>
              <div className="flex items-start space-x-2">
                <div className="w-2 h-2 bg-secondary rounded-full mt-2 flex-shrink-0" />
                <div>
                  <p className="font-medium text-gray-900">Time Formats</p>
                  <p>Use 30m, 2.5h, 90min for different durations</p>
                </div>
              </div>
              <div className="flex items-start space-x-2">
                <div className="w-2 h-2 bg-success rounded-full mt-2 flex-shrink-0" />
                <div>
                  <p className="font-medium text-gray-900">Privacy First</p>
                  <p>All data stays local - no cloud syncing required</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;