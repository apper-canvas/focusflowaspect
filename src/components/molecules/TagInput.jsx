import React, { useState } from "react";
import Input from "@/components/atoms/Input";
import Badge from "@/components/atoms/Badge";
import ApperIcon from "@/components/ApperIcon";

const TagInput = ({ 
  tags = [], 
  selectedTags = [], 
  onChange, 
  placeholder = "Type to add tags..." 
}) => {
  const [inputValue, setInputValue] = useState("");

  const handleInputKeyDown = (e) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      const tag = inputValue.trim();
      if (tag && !selectedTags.includes(tag)) {
        onChange([...selectedTags, tag]);
        setInputValue("");
      }
    } else if (e.key === "Backspace" && !inputValue && selectedTags.length > 0) {
      onChange(selectedTags.slice(0, -1));
    }
  };

  const removeTag = (tagToRemove) => {
    onChange(selectedTags.filter(tag => tag !== tagToRemove));
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {selectedTags.map((tag, index) => (
          <Badge key={index} variant="project" className="group cursor-pointer">
            {tag}
            <ApperIcon
              name="X"
              size={14}
              className="ml-1 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={() => removeTag(tag)}
            />
          </Badge>
        ))}
      </div>
      <Input
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleInputKeyDown}
        placeholder={placeholder}
        className="text-sm"
      />
      {inputValue && (
        <div className="flex flex-wrap gap-1">
          {tags
            .filter(tag => 
              tag.name.toLowerCase().includes(inputValue.toLowerCase()) &&
              !selectedTags.includes(tag.name)
            )
            .slice(0, 5)
            .map(tag => (
              <button
                key={tag.Id}
                onClick={() => {
                  onChange([...selectedTags, tag.name]);
                  setInputValue("");
                }}
                className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
              >
                {tag.name}
              </button>
            ))
          }
        </div>
      )}
    </div>
  );
};

export default TagInput;