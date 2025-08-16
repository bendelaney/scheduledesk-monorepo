'use client'

import React, { useState } from "react";
import ScheduleList from "../ScheduleList";
import { PlusCircle, Archive, Gear } from "../Icons";
import "./Sidebar.scss";

interface SidebarProps {
  isSidebarOpen: boolean;
}

const Sidebar: React.FC<SidebarProps> = (props) => {
  const [showNewScheduleUI, setShowNewScheduleUI] = useState(false);

  const handleNewSchedule = () => {
    alert("New Schedule UI coming soon!");
    setShowNewScheduleUI(true);
  }
  
  return (
    <div className={`sidebar ${props.isSidebarOpen ? 'open' : 'closed'}`}>
      <button className="new-schedule" onClick={handleNewSchedule}>
        <PlusCircle/>New Schedule
      </button>
      <ScheduleList />
      <div className="utility-actions">
        <button><Archive/>Schedule Archive</button>
        <button><Gear/>Settings</button>
      </div>
    </div>
  );
};

export default Sidebar;