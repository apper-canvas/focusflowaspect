import React from "react";
import { cn } from "@/utils/cn";

const Badge = React.forwardRef(({ 
  className, 
  variant = "default",
  children, 
  ...props 
}, ref) => {
  const variants = {
    default: "bg-surface text-primary border-primary/20",
    billable: "bg-success/10 text-success border-success/20",
    nonBillable: "bg-gray-100 text-gray-600 border-gray-200",
    project: "bg-gradient-to-r from-primary/10 to-secondary/10 text-primary border-primary/30"
  };

  return (
    <span
      ref={ref}
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border",
        "transition-all duration-200",
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
});

Badge.displayName = "Badge";

export default Badge;