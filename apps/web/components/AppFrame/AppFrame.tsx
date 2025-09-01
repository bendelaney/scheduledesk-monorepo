'use client'

import React, { useEffect, useRef, useState } from "react";
import TopBar from "../TopBar";
import "./AppFrame.scss";

interface AppFrameProps {
  className?: string;
  children: React.ReactNode;
  sidebarContent?: React.ReactNode;
  sidebarOpen?: boolean;
  sidebarWidth?: string;
}

const AppFrame: React.FC<AppFrameProps> = ({ 
  className,
  children, 
  sidebarContent,
  sidebarOpen,
  sidebarWidth = "240px"
}) => {
  const [isSidebarOpen, setSidebarOpen] = useState(sidebarOpen ?? true);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    // Load sidebar state from localStorage on client side
    const savedSidebarState = localStorage.getItem('sidebarState');
    if (savedSidebarState) {
      setSidebarOpen(JSON.parse(savedSidebarState));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('sidebarState', JSON.stringify(isSidebarOpen));
  }, [isSidebarOpen]);

  useEffect(() => {
    if (!sidebarContent) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '\\' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setSidebarOpen(prev => !prev);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className={`app-frame ${className}`}>
      <TopBar
        sidebar={!!sidebarContent}
        toggleSidebar={() => setSidebarOpen(!isSidebarOpen)}
        isSidebarOpen={isSidebarOpen}
      />
      
      <div className="content-wrapper">
        {sidebarContent && (
          <div
            className={`sidebar ${isSidebarOpen ? 'open' : 'closed'}`}
            // style={{ width: isSidebarOpen ? sidebarWidth : '0' }}
          >
            {sidebarContent}
          </div>
        )}

        {/* <PopoverProvider scrollContainerRef={scrollContainerRef}> */}
          <div className="main-content" ref={scrollContainerRef}>
            {children}
          </div>
        {/* </PopoverProvider> */}
      </div>
    </div>
  );
}

export default AppFrame;