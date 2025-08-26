import React from "react";
import { cn } from "@/utils/cn";

const Input = React.forwardRef(({ 
  className, 
  type = "text", 
  ...props 
}, ref) => {
  // Filter out non-DOM props to prevent React warnings
  const {
    helpText,
    helptext,
    onValidate,
    validation,
    validationRules,
    errorMessage,
    successMessage,
    hint,
    description,
    customRenderer,
    ...domProps
  } = props;

  return (
    <input
      type={type}
      ref={ref}
      className={cn(
        "flex w-full rounded-lg border border-gray-300 bg-white px-3 py-2",
        "text-sm placeholder:text-gray-400",
        "transition-all duration-200",
        "hover:border-secondary",
        "focus:border-primary focus:ring-2 focus:ring-primary/20",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...domProps}
    />
  );
});

Input.displayName = "Input";

export default Input;