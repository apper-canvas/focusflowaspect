import React, { useEffect, useState } from "react";
import { formatDuration } from "@/utils/timeUtils";
import ApperIcon from "@/components/ApperIcon";
import Card from "@/components/atoms/Card";

const QuickStats = ({ stats }) => {
  const [goals, setGoals] = useState(null);

  useEffect(() => {
    const savedGoals = localStorage.getItem("focusflow-goals");
    if (savedGoals) {
      setGoals(JSON.parse(savedGoals));
    }
  }, []);

  // Calculate goal progress
  const todayHours = Math.round(stats.today / 3600 * 10) / 10;
  const weekHours = Math.round(stats.week / 3600 * 10) / 10;
  const dailyGoalProgress = goals ? Math.min((todayHours / goals.daily.workHours) * 100, 100) : 0;
  const weeklyGoalProgress = goals ? Math.min((weekHours / goals.weekly.billableHours) * 100, 100) : 0;

  const statCards = [
    {
      title: "Today",
      value: formatDuration(stats.today || 0),
      subtitle: goals ? `${Math.round(dailyGoalProgress)}% of ${goals.daily.workHours}h goal` : null,
      icon: "Clock",
      color: "text-primary",
      progress: dailyGoalProgress
    },
    {
      title: "This Week",
      value: formatDuration(stats.week || 0),
      subtitle: goals ? `${Math.round(weeklyGoalProgress)}% of ${goals.weekly.billableHours}h goal` : null,
      icon: "Calendar",
      color: "text-secondary",
      progress: weeklyGoalProgress
    },
    {
      title: "Billable",
      value: formatDuration(stats.billable || 0),
      subtitle: stats.week > 0 ? `${Math.round((stats.billable / stats.week) * 100)}% of total time` : null,
      icon: "DollarSign",
      color: "text-success"
    },
    {
      title: "Active Projects",
      value: stats.activeProjects || 0,
      subtitle: goals && goals.projects ? `${goals.projects.length} goal projects` : null,
      icon: "FolderOpen",
      color: "text-info"
    }
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {statCards.map((stat, index) => (
        <Card key={index} className="p-4 hover:scale-[1.02] transition-transform">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-lg bg-gradient-to-br from-surface to-white ${stat.color}`}>
              <ApperIcon name={stat.icon} size={20} />
            </div>
            <div>
              <p className="text-sm text-gray-600 font-medium">{stat.title}</p>
              <p className="text-lg font-bold text-gray-900">{stat.value}</p>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default QuickStats;