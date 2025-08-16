'use client'

import React from "react";
import {
  SidebarClosed,
  SidebarOpen,
  SyncWithJobber,
} from "../Icons";
import "./TopBar.scss";

interface TopBarProps {
  isSidebarOpen: boolean;
  isSplitFrameActive: boolean;
  toggleSidebar: () => void;
}

const TopBar: React.FC<TopBarProps> = (props) => {
  return (
    <div className="top-bar">
      <button
        className="sidebar-toggle"
        onClick={props.toggleSidebar}
      >
        {props.isSidebarOpen ? <SidebarOpen /> : <SidebarClosed />}
      </button>
      <button
        className="sync-with-jobber"
        onClick={() => {
          alert("Sync with Jobber");
        }}
      >
        <SyncWithJobber />
      </button>
    </div>
  );
};

export default TopBar;