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

  // Handle escape key press
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape' && isVisible && !isSubmitting) {
        handleDismiss();
      }
    };

    if (isVisible) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isVisible, isSubmitting]);

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

  const handleBackdropClick = (event) => {
    if (event.target === event.currentTarget && !isSubmitting) {
      handleDismiss();
    }
  };

  if (!isVisible) return null;

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 popup-backdrop"
      onClick={handleBackdropClick}
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm popup-backdrop-blur" />
      
      <Card className={cn(
        "relative max-w-md w-full p-8 shadow-2xl border-0",
        "transform transition-all duration-300 ease-out",
        "popup-modal animate-popup-in"
      )}>
        {/* Close button */}
        <button
          onClick={handleDismiss}
          disabled={isSubmitting}
          className="absolute top-4 right-4 p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200 disabled:opacity-50"
          aria-label="Close popup"
        >
          <ApperIcon name="X" size={18} className="text-gray-400" />
        </button>

        <div className="text-center space-y-6">
          {/* Header */}
          <div className="space-y-3">
            <div className="w-20 h-20 bg-gradient-to-br from-warning/20 to-warning/30 rounded-full flex items-center justify-center mx-auto">
              <ApperIcon name="Clock" size={36} className="text-warning" />
            </div>
            
            <div className="space-y-2">
              <h2 className="text-xl font-semibold text-gray-900 font-display">
                {customPrompt || "Away from keyboard?"}
              </h2>
              <p className="text-base text-gray-600">
                You've been idle for <span className="font-semibold text-warning">{formatIdleTime(idleTime)}</span>
              </p>
              <p className="text-sm text-gray-500">
                What were you doing during this time?
              </p>
            </div>
          </div>

          {/* Category Buttons */}
          <div className="grid grid-cols-2 gap-4">
            {categories.map((category) => (
              <Button
                key={category.id}
                variant="outline"
                size="lg"
                onClick={() => handleCategorize(category)}
                disabled={isSubmitting}
                className={cn(
                  "flex flex-col items-center space-y-3 p-6 h-auto border-2",
                  "hover:scale-105 hover:shadow-md transition-all duration-200",
                  "focus:ring-2 focus:ring-primary focus:ring-offset-2"
                )}
              >
                <div className={cn("w-10 h-10 rounded-full flex items-center justify-center", category.color)}>
                  <ApperIcon name={category.icon} size={20} />
                </div>
                <span className="text-sm font-medium text-gray-900">{category.label}</span>
              </Button>
            ))}
          </div>

          {/* Actions */}
          <div className="pt-6 border-t border-gray-200">
            <Button
              variant="ghost"
              size="lg"
              onClick={handleDismiss}
              disabled={isSubmitting}
              className="w-full justify-center"
            >
              <ApperIcon name="ArrowRight" size={16} className="mr-2" />
              Continue Working
            </Button>
          </div>

          {/* Loading State */}
          {isSubmitting && (
            <div className="flex items-center justify-center pt-4">
              <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin mr-3"></div>
              <span className="text-sm text-gray-600 font-medium">Categorizing...</span>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default IdleDetectionPopup;