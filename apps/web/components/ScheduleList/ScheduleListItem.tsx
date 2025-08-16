'use client'

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Ellipsis, Archive } from "../Icons";
import ScheduleItemMenu from "./ScheduleItemMenu";
import Portal from "../Portal";

interface ScheduleListItemProps {
  schedule: {
    id: string;
    title: string;
  };
}

const ScheduleListItem: React.FC<ScheduleListItemProps> = ({ schedule }) => {
  const [showScheduleItemMenu, setShowScheduleItemMenu] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
  const [isActive, setIsActive] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement | null>(null);

  const handleScheduleItemMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (menuButtonRef.current) {
      const rect = menuButtonRef.current.getBoundingClientRect();
      setMenuPosition({ top: rect.top, left: rect.right });        
    }
    setShowScheduleItemMenu(!showScheduleItemMenu); 
  };

  useEffect(() => {
    setIsActive(showScheduleItemMenu);
  }, [showScheduleItemMenu]);

  return (
    <div key={schedule.id} className="schedule-item">
      <Link href={`/schedule/${schedule.id}`}>
        <span>{schedule.title}</span>
      </Link>
      <div className="actions">
        <button
          className={`${isActive ? 'active' : ''}`}
          ref={menuButtonRef}
          onClick={(e) => {
            handleScheduleItemMenu(e);
          }}
          >
          <Ellipsis/>
        </button>
        <button
          onClick={(e) => {
            alert('Archive coming soon!');
            console.log('archive clicked');
            e.preventDefault();
            e.stopPropagation();
          }}
        >
          <Archive/>
        </button>
      </div>

      {showScheduleItemMenu && (
        <Portal>
          <ScheduleItemMenu
            schedule={schedule}
            position={{top: menuPosition.top, left: menuPosition.left-22 }}
            trigger={menuButtonRef}
            onClose={() => setShowScheduleItemMenu(false)}
          />
        </Portal>
      )}
    </div>
  ); 
};

export default ScheduleListItem;