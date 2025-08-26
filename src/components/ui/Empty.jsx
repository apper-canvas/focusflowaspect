import React from "react";
import Button from "@/components/atoms/Button";
import ApperIcon from "@/components/ApperIcon";

const Empty = ({ 
  message = "No data available", 
  action,
  actionLabel = "Get Started",
  icon = "FileText"
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 space-y-6">
      <div className="w-16 h-16 bg-gradient-to-br from-surface to-primary/10 rounded-full flex items-center justify-center">
        <ApperIcon name={icon} size={32} className="text-primary" />
      </div>
      
      <div className="text-center space-y-3 max-w-md">
        <h3 className="text-lg font-semibold text-gray-900 font-display">Nothing here yet</h3>
        <p className="text-sm text-gray-600">{message}</p>
        <p className="text-xs text-gray-500">
          Start tracking your time to see insights and analytics here.
        </p>
      </div>

      {action && (
        <Button onClick={action} size="lg" className="mt-4">
          <ApperIcon name="Play" size={16} className="mr-2" />
          {actionLabel}
        </Button>
      )}

      <div className="flex items-center space-x-6 text-xs text-gray-400 mt-8">
        <div className="flex items-center space-x-1">
          <ApperIcon name="Zap" size={14} />
          <span>AI-powered</span>
        </div>
        <div className="flex items-center space-x-1">
          <ApperIcon name="Shield" size={14} />
          <span>Private & secure</span>
        </div>
        <div className="flex items-center space-x-1">
          <ApperIcon name="Smartphone" size={14} />
          <span>Cross-device</span>
        </div>
      </div>
    </div>
  );
};

export default Empty;