import React from "react";
import ApperIcon from "@/components/ApperIcon";

const Loading = ({ message = "Loading..." }) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 space-y-4">
      <div className="relative">
        <div className="w-12 h-12 rounded-full border-4 border-surface"></div>
        <div className="absolute top-0 left-0 w-12 h-12 rounded-full border-4 border-transparent border-t-primary animate-spin"></div>
      </div>
      
      <div className="text-center space-y-2">
        <p className="text-sm font-medium text-gray-900">{message}</p>
        <p className="text-xs text-gray-500">Just a moment...</p>
      </div>

      {/* Skeleton Cards */}
      <div className="w-full max-w-md space-y-3 mt-8">
        {[1, 2, 3].map((i) => (
          <div key={i} className="animate-pulse">
            <div className="bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg h-16"></div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Loading;