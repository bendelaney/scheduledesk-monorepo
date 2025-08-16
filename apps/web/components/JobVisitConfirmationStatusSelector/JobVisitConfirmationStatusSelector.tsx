'use client'

import React, { forwardRef, useState, useEffect, useRef } from "react";
import { Popover } from "./popover";
import { useClickOutside } from "./use-click-outside";

export type JobVisitConfirmationStatus = 
  | "Unconfirmed"
  | "Confirmed" 
  | "Confirmation Pending"
  | "Partially Confirmed"
  | "Problems"
  | "Questions";

export const statuses: JobVisitConfirmationStatus[] = [
  "Unconfirmed",
  "Confirmed",
  "Confirmation Pending",  
  "Partially Confirmed",
  "Problems",
  "Questions"
];

// Simple status colors for now (can be enhanced with actual icons later)
const statusColors: Record<JobVisitConfirmationStatus, string> = {
  "Unconfirmed": "#999999",
  "Confirmed": "#4CAF50",
  "Confirmation Pending": "#FF9800", 
  "Partially Confirmed": "#2196F3",
  "Problems": "#F44336",
  "Questions": "#9C27B0"
};

export interface JobVisitConfirmationStatusSelectorProps {
  status?: JobVisitConfirmationStatus;
  hideText?: boolean;
  menuVisible?: boolean;
  onOpen?: () => void;
  onClose?: () => void;
  onSelect: (status: JobVisitConfirmationStatus) => void;
}

const JobVisitConfirmationStatusSelector = forwardRef<HTMLDivElement, JobVisitConfirmationStatusSelectorProps>(
  ({ status = "Unconfirmed", hideText = false, menuVisible, onOpen, onClose, onSelect }, ref) => {
    const menuRef = useRef<HTMLDivElement>(null);
    const toggleRef = useRef<HTMLButtonElement>(null);
    const [confirmationStatus, setConfirmationStatus] = useState(status);
    const [showMenu, setShowMenu] = useState(false);

    useClickOutside(menuRef, () => setShowMenu(false), toggleRef);

    useEffect(() => {
      if (showMenu) {
        onOpen?.();
      } else {
        onClose?.();
      }
    }, [showMenu, onOpen, onClose]);

    useEffect(() => {
      if (menuVisible !== undefined) {
        setShowMenu(menuVisible);
      }
    }, [menuVisible]);

    const handleSelect = (selectedStatus: JobVisitConfirmationStatus) => {
      setConfirmationStatus(selectedStatus);
      setShowMenu(false);
      onSelect(selectedStatus);
    };

    return (
      <div ref={ref} className={`jobvisit-confirmation-status-selector ${hideText ? 'no-text' : ''}`}>
        <button 
          ref={toggleRef} 
          className="toggle" 
          onClick={() => setShowMenu(!showMenu)}
        >
          <span 
            className="icon" 
            style={{ 
              width: '18px', 
              height: '18px', 
              backgroundColor: statusColors[confirmationStatus], 
              borderRadius: '50%',
              display: 'inline-block',
              marginRight: hideText ? 0 : '8px'
            }}
          />
          {!hideText && <span className="text">{confirmationStatus}</span>}
        </button>

        {showMenu && (
          <Popover
            targetRef={toggleRef}
            position={'bottomLeft'}
            edge={'topLeft'}
            offset={{ x: -10, y: 8 }}
            onHide={() => setShowMenu(false)}
            noStyles={true}
          >
            <ul ref={menuRef} className="jobvisit-confirmation-status-menu">
              {statuses.map((statusOption) => (
                <li key={statusOption} onClick={() => handleSelect(statusOption)}>
                  <span 
                    className="icon"
                    style={{ 
                      width: '18px', 
                      height: '18px', 
                      backgroundColor: statusColors[statusOption], 
                      borderRadius: '50%',
                      display: 'inline-block',
                      marginRight: '8px'
                    }}
                  />
                  <span className="text">{statusOption}</span>
                </li>
              ))}
            </ul>
          </Popover>
        )}
      </div>
    );
  }
);

JobVisitConfirmationStatusSelector.displayName = 'JobVisitConfirmationStatusSelector';

export { JobVisitConfirmationStatusSelector };