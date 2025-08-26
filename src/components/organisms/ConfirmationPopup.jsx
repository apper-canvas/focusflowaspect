import React, { useEffect } from "react";
import { cn } from "@/utils/cn";
import ApperIcon from "@/components/ApperIcon";
import Card from "@/components/atoms/Card";
import Button from "@/components/atoms/Button";

const ConfirmationPopup = ({ 
  isVisible, 
  onConfirm, 
  onCancel,
  title = "Confirm Action",
  message = "Are you sure you want to proceed?",
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "danger",
  icon = "AlertTriangle",
  isSubmitting = false
}) => {

  // Handle backdrop clicks
  const handleBackdropClick = (event) => {
    if (event.target === event.currentTarget && !isSubmitting) {
      onCancel();
    }
  };

  // Handle escape key press
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape' && isVisible && !isSubmitting) {
        onCancel();
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
  }, [isVisible, isSubmitting, onCancel]);

  if (!isVisible) return null;

  const getIconColor = () => {
    switch (variant) {
      case 'danger': return 'text-error';
      case 'warning': return 'text-warning';
      case 'info': return 'text-info';
      default: return 'text-gray-600';
    }
  };

  const getIconBg = () => {
    switch (variant) {
      case 'danger': return 'bg-gradient-to-br from-error/20 to-error/30';
      case 'warning': return 'bg-gradient-to-br from-warning/20 to-warning/30';
      case 'info': return 'bg-gradient-to-br from-info/20 to-info/30';
      default: return 'bg-gradient-to-br from-gray-200/20 to-gray-300/30';
    }
  };

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
              <div className={cn("w-10 h-10 rounded-full flex items-center justify-center", getIconBg())}>
                <ApperIcon name={icon} size={20} className={getIconColor()} />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 font-display">{title}</h3>
              </div>
            </div>
            <button
              onClick={onCancel}
              disabled={isSubmitting}
              className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors"
            >
              <ApperIcon name="X" size={16} className="text-gray-500" />
            </button>
          </div>

          {/* Message */}
          <div className="text-center py-4">
            <p className="text-gray-700 text-sm leading-relaxed">{message}</p>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <Button
              variant="outline"
              size="md"
              onClick={onCancel}
              disabled={isSubmitting}
              className="flex-1"
            >
              {cancelText}
            </Button>
            <Button
              variant={variant}
              size="md"
              onClick={onConfirm}
              disabled={isSubmitting}
              className="flex-1"
            >
              {isSubmitting && <ApperIcon name="Loader2" size={16} className="mr-2 animate-spin" />}
              {confirmText}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ConfirmationPopup;