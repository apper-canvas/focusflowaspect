import React from "react";
import { cn } from "@/utils/cn";

const Badge = React.forwardRef(({ 
  className, 
  variant = "default",
  children, 
  ...props 
}, ref) => {
const variants = {
    default: "bg-gray-100 text-gray-700 border-gray-300",
    billable: "bg-green-100 text-green-700 border-green-300",
    nonBillable: "bg-gray-100 text-gray-600 border-gray-200",
    project: "bg-purple-100 text-purple-700 border-purple-300"
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