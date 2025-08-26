import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "@/components/organisms/Sidebar";
import Header from "@/components/organisms/Header";
const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
<div className="h-screen flex overflow-hidden bg-gray-50">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header onMenuClick={() => setSidebarOpen(true)} />
        
        <main className="flex-1 relative overflow-y-auto focus:outline-none custom-scrollbar">
          <div className="py-6 px-4 lg:px-6 max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;