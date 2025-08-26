import React, { useContext } from "react";
import { useSelector } from 'react-redux';
import Button from "@/components/atoms/Button";
import ApperIcon from "@/components/ApperIcon";
import { AuthContext } from "@/App";

const Header = ({ onMenuClick }) => {
  // Extract logout function from AuthContext at component top level
  const { logout } = useContext(AuthContext);
  
  return (
    <header className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 lg:hidden z-30">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center space-x-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={onMenuClick}
            className="p-2"
          >
            <ApperIcon name="Menu" size={20} />
          </Button>
          
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center">
              <ApperIcon name="Timer" size={16} className="text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900 font-display">FocusFlow</h1>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          {/* User Info */}
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-success rounded-full flex items-center justify-center">
              <ApperIcon name="User" size={16} className="text-white" />
            </div>
            <span className="text-sm font-medium text-gray-700 hidden sm:block">
              {useSelector((state) => state.user?.user?.firstName || 'User')}
            </span>
          </div>
          
          {/* Logout Button */}
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => {
              logout();
            }}
            className="text-sm"
          >
            <ApperIcon name="LogOut" size={16} className="mr-1" />
            Logout
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;