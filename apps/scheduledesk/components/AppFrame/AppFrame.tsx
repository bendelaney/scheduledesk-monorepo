'use client'

import React, { useEffect, useRef } from "react";
import { SidebarClosed, SidebarOpen } from "../Icons";
// import TopBar from "../TopBar";
import { useKeyboardShortcut } from '@/hooks/useKeyboardShortcut';
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
  onSidebarToggle?: (isOpen: boolean) => void;
  sidebarWidth?: string;
}

const AppFrame: React.FC<AppFrameProps> = ({
  className,
  children,
  showSidebarToggle = true,
  sidebarContent,
  sidebarOpen = true,
  onSidebarToggle,
  sidebarWidth = "240px",
  topBarLeftContent,
  topBarMiddleContent,
  topBarRightContent
}) => {
  const isSidebarOpen = sidebarOpen;
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // When sidebar closes, blur the team member filter field if it's focused
  useEffect(() => {
    if (!isSidebarOpen) {
      const filterInput = document.querySelector('.team-member-list__filter input') as HTMLInputElement;
      if (filterInput && document.activeElement === filterInput) {
        filterInput.blur();
      }
    }
  }, [isSidebarOpen]);

  // / to open sidebar (Priority 40) - non-exclusive
  useKeyboardShortcut(
    '/',
    () => {
      // Open sidebar if it's closed
      if (sidebarContent && !isSidebarOpen && onSidebarToggle) {
        onSidebarToggle(true);
      }
    },
    40,
    [sidebarContent, isSidebarOpen, onSidebarToggle],
    { id: 'app-frame-open-sidebar', exclusive: false }
  );

  // Cmd+\ to toggle sidebar (Priority 40)
  useKeyboardShortcut(
    '\\',
    () => {
      if (sidebarContent && onSidebarToggle) {
        onSidebarToggle(!isSidebarOpen);
      }
    },
    40,
    [sidebarContent, isSidebarOpen, onSidebarToggle],
    { meta: true, id: 'app-frame-toggle-sidebar' }
  );

  const handleToggleSidebar = () => {
    if (onSidebarToggle) {
      onSidebarToggle(!isSidebarOpen);
    }
  }

  return (
    <div className={`app-frame ${className} ${isSidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
      <div className="top-bar">
        <div className="top-bar__left">
          {showSidebarToggle && sidebarContent && (
            <button
              className="sidebar-toggle-button"
              onClick={handleToggleSidebar}
              aria-label="Toggle sidebar CMD+\"
              title="Toggle sidebar - CMD+\"
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
            style={{ width: isSidebarOpen ? sidebarWidth : '0' }}
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