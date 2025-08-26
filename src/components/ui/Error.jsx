import React from "react";
import Button from "@/components/atoms/Button";
import ApperIcon from "@/components/ApperIcon";

const Error = ({ message = "Something went wrong", onRetry }) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 space-y-6">
      <div className="w-16 h-16 bg-gradient-to-br from-error/20 to-error/30 rounded-full flex items-center justify-center">
        <ApperIcon name="AlertTriangle" size={32} className="text-error" />
      </div>
      
      <div className="text-center space-y-2 max-w-md">
        <h3 className="text-lg font-semibold text-gray-900 font-display">Oops! Something went wrong</h3>
        <p className="text-sm text-gray-600">{message}</p>
        <p className="text-xs text-gray-500">
          Don't worry, your data is safe. Try refreshing or check your connection.
        </p>
      </div>

      {onRetry && (
        <Button onClick={onRetry} className="mt-4">
          <ApperIcon name="RefreshCw" size={16} className="mr-2" />
          Try Again
        </Button>
      )}

      <div className="text-xs text-gray-400 bg-gray-50 px-4 py-2 rounded-lg font-mono">
        Error occurred at {new Date().toLocaleTimeString()}
      </div>
    </div>
  );
};

export default Error;