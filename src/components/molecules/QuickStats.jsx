import React from "react";
import Card from "@/components/atoms/Card";
import ApperIcon from "@/components/ApperIcon";
import { formatDuration } from "@/utils/timeUtils";

const QuickStats = ({ stats }) => {
  const statCards = [
    {
      title: "Today",
      value: formatDuration(stats.today || 0),
      icon: "Clock",
      color: "text-primary"
    },
    {
      title: "This Week",
      value: formatDuration(stats.week || 0),
      icon: "Calendar",
      color: "text-secondary"
    },
    {
      title: "Billable",
      value: formatDuration(stats.billable || 0),
      icon: "DollarSign",
      color: "text-success"
    },
    {
      title: "Active Projects",
      value: stats.activeProjects || 0,
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