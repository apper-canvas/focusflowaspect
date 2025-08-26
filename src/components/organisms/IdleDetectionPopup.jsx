import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import ApperIcon from "@/components/ApperIcon";
import Button from "@/components/atoms/Button";
import Card from "@/components/atoms/Card";
import { cn } from "@/utils/cn";
import { timeEntryService } from "@/services/api/timeEntryService";

const IdleDetectionPopup = ({ 
  isVisible, 
  onDismiss, 
  idleTime, 
  customPrompt,
  onCategorize 
}) => {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const categories = [
    { id: "break", label: "Break", icon: "Coffee", color: "bg-accent text-white" },
    { id: "meeting", label: "Meeting", icon: "Users", color: "bg-info text-white" },
    { id: "away", label: "Away", icon: "LogOut", color: "bg-warning text-white" },
    { id: "other", label: "Other", icon: "MoreHorizontal", color: "bg-gray-500 text-white" }
  ];

  const formatIdleTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    if (minutes > 0) {
      return `${minutes}m ${remainingSeconds}s`;
    }
    return `${remainingSeconds}s`;
  };

  const handleCategorize = async (category) => {
    setIsSubmitting(true);
    try {
      await onCategorize(category);
      toast.success(`Idle time categorized as ${category.label}`);
      onDismiss();
    } catch (error) {
      toast.error("Failed to categorize idle time");
      console.error("Categorize error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDismiss = () => {
    onDismiss();
    toast.info("Idle detection dismissed - continuing current session");
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="max-w-md w-full p-6 animate-in fade-in duration-300">
        <div className="text-center space-y-4">
          {/* Header */}
          <div className="w-16 h-16 bg-gradient-to-br from-warning/20 to-warning/30 rounded-full flex items-center justify-center mx-auto">
            <ApperIcon name="Clock" size={32} className="text-warning" />
          </div>

          {/* Custom Prompt */}
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-gray-900 font-display">
              {customPrompt || "Away from keyboard?"}
            </h3>
            <p className="text-sm text-gray-600">
              You've been idle for <span className="font-medium text-warning">{formatIdleTime(idleTime)}</span>
            </p>
            <p className="text-xs text-gray-500">
              What were you doing during this time?
            </p>
          </div>

          {/* Category Buttons */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            {categories.map((category) => (
              <Button
                key={category.id}
                variant="outline"
                size="md"
                onClick={() => handleCategorize(category)}
                disabled={isSubmitting}
                className={cn(
                  "flex flex-col items-center space-y-2 p-4 h-auto",
                  "hover:scale-105 transition-all duration-200"
                )}
              >
                <div className={cn("w-8 h-8 rounded-full flex items-center justify-center", category.color)}>
                  <ApperIcon name={category.icon} size={16} />
                </div>
                <span className="text-sm font-medium">{category.label}</span>
              </Button>
            ))}
          </div>

          {/* Actions */}
          <div className="flex space-x-3 pt-4 border-t">
            <Button
              variant="ghost"
              onClick={handleDismiss}
              disabled={isSubmitting}
              className="flex-1"
            >
              <ApperIcon name="X" size={16} className="mr-2" />
              Continue Working
            </Button>
          </div>

          {/* Loading State */}
          {isSubmitting && (
            <div className="flex items-center justify-center pt-2">
              <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin mr-2"></div>
              <span className="text-sm text-gray-600">Categorizing...</span>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default IdleDetectionPopup;