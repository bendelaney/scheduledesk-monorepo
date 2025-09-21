'use client'

import React, { useEffect, useRef, useState } from "react";
import { SidebarClosed, SidebarOpen } from "../Icons";
// import TopBar from "../TopBar";
import "./AppFrame.scss";

interface AppFrameProps {
  className?: string;
  children: React.ReactNode;
  topBarLeftContent?: React.ReactNode;
  topBarMiddleContent?: React.ReactNode;
  topBarRightContent?: React.ReactNode;
  showSidebarToggle?: boolean;
  sidebarContent?: React.ReactNode;
  sidebarOpen?: boolean;
  sidebarWidth?: string;
}

const AppFrame: React.FC<AppFrameProps> = ({ 
  className,
  children, 
  showSidebarToggle = true,
  sidebarContent,
  sidebarOpen,
  sidebarWidth = "240px",
  topBarLeftContent,
  topBarMiddleContent,
  topBarRightContent
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
      if (e.key === '/' && (!e.metaKey || !e.ctrlKey)) {
        e.preventDefault();
        setSidebarOpen(true);
      }
      if (e.key === '\\' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setSidebarOpen(prev => !prev);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleToggleSidebar = () => {
    setSidebarOpen(!isSidebarOpen);
  }

  return (
    <div className={`app-frame ${className} ${isSidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
      <div className="top-bar">
        <div className="top-bar__left">
          {showSidebarToggle && (
            <button
              className="sidebar-toggle-button"
              onClick={handleToggleSidebar}
              aria-label="Toggle sidebar (CMD+\\)"
              title="Toggle sidebar (CMD+\\)"
            >
              {isSidebarOpen ? <SidebarOpen /> : <SidebarClosed />}
            </button>
          )}
          {topBarLeftContent}
        </div>
        <div className="top-bar__middle">
          {topBarMiddleContent}
        </div>
        <div className="top-bar__right">
          {topBarRightContent}
        </div>
      </div>

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