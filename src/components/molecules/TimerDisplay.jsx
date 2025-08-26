import React from "react";
import { formatDuration } from "@/utils/timeUtils";
import { cn } from "@/utils/cn";

const TimerDisplay = ({ 
  duration, 
  isRunning = false, 
  size = "lg",
  className 
}) => {
  const sizes = {
    sm: "text-lg font-semibold",
    md: "text-2xl font-semibold",
    lg: "text-4xl font-bold",
    xl: "text-6xl font-bold"
  };

  return (
    <div className={cn(
      "font-mono tracking-wider text-primary",
      isRunning && "timer-tick",
      sizes[size],
      className
    )}>
      {formatDuration(duration)}
    </div>
  );
};

export default TimerDisplay;