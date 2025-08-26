import React from "react";
import Label from "@/components/atoms/Label";
import Input from "@/components/atoms/Input";
import Select from "@/components/atoms/Select";
import { cn } from "@/utils/cn";

const FormField = ({ 
  label, 
  type = "input", 
  error, 
  children,
  className,
  ...props 
}) => {
const renderField = () => {
    if (type === "select") {
      return <Select {...props}>{children}</Select>;
    }
    if (type === "textarea") {
      return <textarea {...props} className="flex min-h-[80px] w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary disabled:cursor-not-allowed disabled:opacity-50" />;
    }
    return <Input {...props} />;
  };

  return (
    <div className={cn("space-y-1", className)}>
      {label && <Label>{label}</Label>}
      {renderField()}
      {error && (
        <p className="text-sm text-error font-medium">{error}</p>
      )}
    </div>
  );
};

export default FormField;