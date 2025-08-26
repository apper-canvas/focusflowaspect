import React, { useEffect, useState } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import IdleDetectionPopup from "@/components/organisms/IdleDetectionPopup";
import { idleDetectionService } from "@/services/idleDetectionService";
import Projects from "@/components/pages/Projects";
import Dashboard from "@/components/pages/Dashboard";
import Settings from "@/components/pages/Settings";
import Reports from "@/components/pages/Reports";
import Layout from "@/components/organisms/Layout";
const App = () => {
  const [idleState, setIdleState] = useState({
    isIdle: false,
    idleTime: 0,
    customPrompt: ""
  });

  useEffect(() => {
    // Start idle detection monitoring
    idleDetectionService.startMonitoring();

    // Listen for idle detection events
    const unsubscribe = idleDetectionService.onIdleDetected((event) => {
      setIdleState({
        isIdle: true,
        idleTime: event.idleTime,
        customPrompt: event.customPrompt
      });
    });

    return () => {
      idleDetectionService.stopMonitoring();
      unsubscribe();
    };
  }, []);

  const handleIdleCategorize = async (category) => {
    await idleDetectionService.categorizeIdleTime(category, idleState.idleTime);
    setIdleState({ isIdle: false, idleTime: 0, customPrompt: "" });
  };

  const handleIdleDismiss = () => {
    setIdleState({ isIdle: false, idleTime: 0, customPrompt: "" });
  };

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-white font-body">
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="reports" element={<Reports />} />
            <Route path="projects" element={<Projects />} />
            <Route path="settings" element={<Settings />} />
          </Route>
        </Routes>
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
theme="light"
        />
        {idleState.isIdle && (
          <IdleDetectionPopup
            isOpen={idleState.isIdle}
            idleTime={idleState.idleTime}
            customPrompt={idleState.customPrompt}
            onCategorize={handleIdleCategorize}
            onDismiss={handleIdleDismiss}
          />
        )}
      </div>
    </BrowserRouter>
  );
};

export default App;