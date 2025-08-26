import React from "react";
import { BrowserRouter, Routes } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import IdleDetectionPopup from "@/components/IdleDetectionPopup";
import { useIdleDetection } from "@/hooks/useIdleDetection";

const AppContinuation = () => {
  const { idleState, handleIdleDismiss, handleIdleCategorize } = useIdleDetection();

  return (
    <BrowserRouter>
      <div className="app">
        <Routes>
        </Routes>
        
        {/* Global Idle Detection Popup */}
        <IdleDetectionPopup
          isVisible={idleState.isIdle}
          onDismiss={handleIdleDismiss}
          idleTime={idleState.idleTime}
          customPrompt={idleState.customPrompt}
          onCategorize={handleIdleCategorize}
        />
        
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
      </div>
    </BrowserRouter>
  );
};

export default AppContinuation;