import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { timeEntryService } from "@/services/api/timeEntryService";
import { cn } from "@/utils/cn";
import ApperIcon from "@/components/ApperIcon";
import Card from "@/components/atoms/Card";
import Button from "@/components/atoms/Button";

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

    const handleBackdropClick = (event) => {
      if (event.target === event.currentTarget && !isSubmitting) {
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

if (!isVisible) return null;

  return (
    <div 
      className="fixed inset-0 z-[100] popup-backdrop popup-backdrop-blur bg-black/50 flex items-center justify-center p-4"
      onClick={handleBackdropClick}
    >
      <Card className="popup-modal w-full max-w-md mx-auto shadow-2xl border-0">
        <div className="p-6 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-warning/20 to-warning/30 rounded-full flex items-center justify-center">
                <ApperIcon name="Clock" size={20} className="text-warning" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 font-display">Idle Time Detected</h3>
                <p className="text-sm text-gray-600">You've been idle for {formatIdleTime(idleTime)}</p>
              </div>
            </div>
            <button
              onClick={handleDismiss}
              disabled={isSubmitting}
              className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors"
            >
              <ApperIcon name="X" size={16} className="text-gray-500" />
            </button>
          </div>

          {/* Custom Prompt */}
          {customPrompt && (
            <div className="bg-surface rounded-lg p-4">
              <p className="text-sm text-gray-700 font-medium">{customPrompt}</p>
            </div>
          )}

          {/* Time Display */}
          <div className="text-center py-4">
            <div className="text-3xl font-bold text-primary font-display mb-2">
              {formatIdleTime(idleTime)}
            </div>
            <p className="text-sm text-gray-600">Time to categorize</p>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="success"
                size="md"
                onClick={() => handleCategorize('productive')}
                disabled={isSubmitting}
                className="w-full"
              >
                <ApperIcon name="CheckCircle" size={16} className="mr-2" />
                Productive
              </Button>
              <Button
                variant="outline"
                size="md"
                onClick={() => handleCategorize('break')}
                disabled={isSubmitting}
                className="w-full"
              >
                <ApperIcon name="Coffee" size={16} className="mr-2" />
                Break
              </Button>
            </div>
            
            <Button
              variant="danger"
              size="md"
              onClick={() => handleCategorize('distraction')}
              disabled={isSubmitting}
              className="w-full"
            >
              <ApperIcon name="AlertTriangle" size={16} className="mr-2" />
              Distraction
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleDismiss}
              disabled={isSubmitting}
              className="w-full mt-3"
            >
              Skip for now
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default IdleDetectionPopup;
