import React from "react";
import { NavLink, useLocation } from "react-router-dom";
import ApperIcon from "@/components/ApperIcon";
import { cn } from "@/utils/cn";

const Sidebar = ({ isOpen, onClose }) => {
  const location = useLocation();

  const navigation = [
    { name: "Dashboard", href: "/", icon: "Home" },
    { name: "Reports", href: "/reports", icon: "BarChart3" },
    { name: "Projects", href: "/projects", icon: "FolderOpen" },
    { name: "Settings", href: "/settings", icon: "Settings" }
  ];

  const NavItem = ({ item }) => (
    <NavLink
      to={item.href}
      onClick={onClose}
      className={({ isActive }) =>
        cn(
          "group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200",
          isActive
            ? "bg-gradient-to-r from-primary to-secondary text-white shadow-lg"
            : "text-gray-700 hover:bg-surface hover:text-primary"
        )
      }
    >
      <ApperIcon
        name={item.icon}
        size={20}
        className="mr-3 flex-shrink-0"
      />
      {item.name}
    </NavLink>
  );

  return (
    <>
      {/* Mobile Overlay */}
      <div
        className={cn(
          "fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={onClose}
      />

      {/* Desktop Sidebar */}
      <div className="hidden lg:flex lg:flex-shrink-0">
        <div className="flex flex-col w-64">
          <div className="flex flex-col flex-grow pt-5 pb-4 overflow-y-auto bg-white border-r border-gray-200">
            <div className="flex items-center flex-shrink-0 px-4 mb-8">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center">
                  <ApperIcon name="Timer" size={24} className="text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900 font-display">FocusFlow</h1>
                  <p className="text-xs text-gray-500">AI Time Tracker</p>
                </div>
              </div>
            </div>
            
            <nav className="flex-1 px-4 space-y-2">
              {navigation.map((item) => (
                <NavItem key={item.name} item={item} />
              ))}
            </nav>

            <div className="px-4 pt-4 border-t border-gray-200">
              <div className="flex items-center space-x-3 p-3 rounded-lg bg-gradient-to-r from-surface/50 to-white">
                <div className="w-8 h-8 bg-success rounded-full flex items-center justify-center">
                  <ApperIcon name="User" size={16} className="text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">Local User</p>
                  <p className="text-xs text-gray-500">Privacy Mode</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Sidebar */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 bg-white transform transition-transform duration-300 ease-in-out lg:hidden",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between flex-shrink-0 px-4 py-4 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center">
                <ApperIcon name="Timer" size={20} className="text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900 font-display">FocusFlow</h1>
                <p className="text-xs text-gray-500">AI Time Tracker</p>
              </div>
            </div>
            
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-gray-400 hover:text-gray-500 hover:bg-gray-100 transition-colors"
            >
              <ApperIcon name="X" size={20} />
            </button>
          </div>

          <nav className="flex-1 px-4 py-4 space-y-2">
            {navigation.map((item) => (
              <NavItem key={item.name} item={item} />
            ))}
          </nav>

          <div className="px-4 py-4 border-t border-gray-200">
            <div className="flex items-center space-x-3 p-3 rounded-lg bg-gradient-to-r from-surface/50 to-white">
              <div className="w-8 h-8 bg-success rounded-full flex items-center justify-center">
                <ApperIcon name="User" size={16} className="text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">Local User</p>
                <p className="text-xs text-gray-500">Privacy Mode</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;