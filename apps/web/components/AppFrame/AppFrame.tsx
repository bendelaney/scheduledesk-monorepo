'use client'

import React, { useEffect, useRef, useState } from "react";
import TopBar from "../TopBar";
import Sidebar from "../Sidebar";
import { PopoverProvider } from "../Popover";
import "./AppFrame.scss";

interface AppFrameProps {
  children: React.ReactNode;
  sidebar?: React.ReactNode;
  sidebarOpen?: boolean;
  sidebarWidth?: string;
}

const AppFrame: React.FC<AppFrameProps> = ({ 
  children, 
  sidebar,
  sidebarOpen,
  sidebarWidth = "300px"
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

  return (
    <div className="app-frame">
      <TopBar
        toggleSidebar={() => setSidebarOpen(!isSidebarOpen)}
        isSidebarOpen={isSidebarOpen}
        isSplitFrameActive={false}
      />
      
      <div className="content-wrapper">
        {sidebar ? (
          <div 
            className={`sidebar-container ${isSidebarOpen ? 'open' : 'closed'}`}
            style={{ width: isSidebarOpen ? sidebarWidth : '0' }}
          >
            {sidebar}
          </div>
        ) : (
          <Sidebar isSidebarOpen={isSidebarOpen} />
        )}

        <PopoverProvider scrollContainerRef={scrollContainerRef}>
          <div className="main-content" ref={scrollContainerRef}>
            {children}
          </div>
        </PopoverProvider>
      </div>
    </div>
  );
}

export default AppFrame;