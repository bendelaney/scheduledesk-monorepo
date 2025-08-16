'use client'

import React, { useRef } from "react";
import { Share, Rename, Trashcan } from "../Icons";
import { useClickOutside } from '../../hooks/useClickOutside';

type ScheduleItem = {
  id: string;
  title: string;
  date_created?: string;
};

interface ScheduleItemMenuProps {
  schedule: ScheduleItem | null;
  position?: React.CSSProperties;
  trigger: React.RefObject<HTMLElement>;
  onClose: () => void;
}

const ScheduleItemMenu: React.FC<ScheduleItemMenuProps> = ({
  schedule,
  position,
  trigger,
  onClose
}) => {
  const menuRef = useRef<HTMLDivElement>(null);
  useClickOutside(menuRef as React.RefObject<HTMLElement>, onClose, trigger);

  const handleShareSchedule = () => {
    alert("'Share' coming soon!");
    console.log("Share this schedule: ID:" + (schedule ? schedule.id : ''));
  };
  
  const handleRenameSchedule = () => {
    alert("'Rename' coming soon!");
    console.log("Rename this schedule: ID:" + (schedule ? schedule.id : ''));
  };
  
  const handleDeleteSchedule = () => {
    alert("'Delete' coming soon!");
    console.log("Delete this schedule: ID:" + (schedule ? schedule.id : ''));
  };

  return (
    <ul ref={menuRef} className="schedule-item-menu" style={position}>
      <li onClick={handleShareSchedule}>
        <Share /><span>Share</span>
      </li>
      <li onClick={handleRenameSchedule}>
        <Rename /><span>Rename</span>
      </li>
      <li onClick={handleDeleteSchedule}>
        <Trashcan/><span>Delete Schedule</span>
      </li>
    </ul>
  );
}

export default ScheduleItemMenu;