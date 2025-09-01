'use client'

import React from "react";
import { useRouter, usePathname } from 'next/navigation';
import {
  SidebarClosed,
  SidebarOpen,
  SyncWithJobber,
} from "../Icons";
import MainNavigation from '@/config/MainNavigation'
import "./TopBar.scss";

interface TopBarProps {
  sidebar: boolean;
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
}

const TopBar: React.FC<TopBarProps> = ({
  sidebar = true,
  isSidebarOpen,
  toggleSidebar
}) => {
  const router = useRouter();
  const pathname = usePathname();

  const handleNavigation = (path: string) => {
    router.push(path);
  };

  return (
    <div className="top-bar">
      {sidebar && (
        <button
          className="sidebar-toggle"
          onClick={toggleSidebar}
        >
          {isSidebarOpen ? <SidebarOpen /> : <SidebarClosed />}
        </button>
      )}
      <div className="top-bar__navigation">
        {MainNavigation.map((navItem) => {
          const Icon = navItem.icon;
          const isActive = pathname === navItem.path;
          
          return (
            <button
              key={navItem.id}
              id={`main-nav-${navItem.id}`}
              className={`main-nav-button ${navItem.className} ${isActive ? 'active' : ''}`}
              onClick={() => handleNavigation(navItem.path)}
            >
              <Icon />
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default TopBar;