import React from "react";
import Select from "@/components/atoms/Select";
import { cn } from "@/utils/cn";

const ProjectSelector = ({ 
  projects = [], 
  value, 
  onChange, 
  placeholder = "Select project...",
  className 
}) => {
  return (
    <div className={cn("relative", className)}>
      <Select
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        className="pr-8"
      >
        <option value="" disabled>{placeholder}</option>
        {projects.map(project => (
          <option key={project.Id} value={project.name}>
            {project.name}
          </option>
        ))}
      </Select>
      {value && (
        <div 
          className="absolute right-8 top-1/2 transform -translate-y-1/2 w-3 h-3 rounded-full"
          style={{ 
            backgroundColor: projects.find(p => p.name === value)?.color || "#5B4FB6" 
          }}
        />
      )}
    </div>
  );
};

export default ProjectSelector;