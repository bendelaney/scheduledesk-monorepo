'use client'

import React, { ForwardRefRenderFunction, useState, useEffect, useRef } from "react";
import BDPopover, { PopoverContext } from "components/Popover";
import { JobVisitConfirmationStatus, StatusIconMapping } from "types";
import {
  StatusOpen,
  StatusConfirmed,
  StatusConfirmedActive,
  StatusPartiallyConfirmed,
  StatusPartiallyConfirmedActive,
  StatusPending,
  StatusPendingActive,
  StatusImportant,
  StatusImportantActive,
  StatusQuestion,
  StatusQuestionActive,
} from "components/Icons";
import "./JobVisitConfirmationStatusSelector.scss";

export const statuses: JobVisitConfirmationStatus[] = [
    "Unconfirmed",
    "Confirmed",
    "Confirmation Pending",
    "Partially Confirmed",
    "Problems",
    "Questions"
  ];
  
// Define a mapping from status to icon
export const statusIcons: StatusIconMapping = {
  "Unconfirmed": <StatusOpen />,
  "Confirmed": <StatusConfirmed />,
  "Confirmation Pending": <StatusPending />,
  "Partially Confirmed": <StatusPartiallyConfirmed />,
  // "Important": <StatusImportant />,
  "Problems": <StatusImportant />,
  "Questions": <StatusQuestion />,
};
export const statusIconsActive: StatusIconMapping = {
  "Unconfirmed": <StatusOpen />,
  "Confirmed": <StatusConfirmedActive />,
  "Confirmation Pending": <StatusPendingActive />,
  "Partially Confirmed": <StatusPartiallyConfirmedActive />,
  "Problems": <StatusImportantActive />,
  "Questions": <StatusQuestionActive />,
};

// Define the props of JobVisitConfirmationStatusSelector component
export interface JobVisitConfirmationStatusSelectorProps {
  status?: JobVisitConfirmationStatus;
  hideText?: boolean;
  menuVisible?: boolean;
  onOpen?: () => void;
  onClose?: () => void;
  onSelect: (status: JobVisitConfirmationStatus) => void;
}

const JobVisitConfirmationStatusSelector: ForwardRefRenderFunction<HTMLDivElement, JobVisitConfirmationStatusSelectorProps> = (
  { status, hideText, menuVisible, onOpen, onClose, onSelect },
  ref
) => {
  const menuRef = useRef<HTMLElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const [confirmationStatus, setConfirmationStatus] = useState((status || "Open") as JobVisitConfirmationStatus);
  const [showMenu, setShowMenu] = useState(false);

  useEffect(() => {
    if (showMenu) {
      onOpen?.();
    } else {
      onClose?.();
    }
  }, [showMenu, onOpen, onClose]);

  useEffect(() => {
    setShowMenu(menuVisible || false);
  }, [menuVisible]);

  const handleSelect = (status: JobVisitConfirmationStatus) => {
    setConfirmationStatus(status);
    setShowMenu(false);
    onSelect(status);
  };

  return (
    <div ref={ref} className={`jobvisit-confirmation-status-selector ${hideText ? 'no-text':''}`}>
      <button ref={toggleRef} className="toggle" onClick={() => setShowMenu(!showMenu)} >
        <span className="icon">{statusIconsActive[confirmationStatus]}</span>
        {!hideText && <span className="text">{confirmationStatus}</span>}
      </button>

      {showMenu && (
        <BDPopover
            targetRef={toggleRef as React.RefObject<HTMLElement>}
            scrollContainerRef={menuRef as React.RefObject<HTMLDivElement>}
            position={'bottomLeft'}
            edge={'topLeft'}
            offset={{ x: -10, y: 8 }}
            onHide={() => setShowMenu(false)}
            noStyles={true}
        >
          <ul ref={menuRef as React.RefObject<HTMLUListElement>} className="jobvisit-confirmation-status-menu">
            {statuses.map((status) => (
              <li key={status} onClick={() => handleSelect(status)}>
                <span className="icon inactive">{statusIcons[status]}</span>
                <span className="icon active">{statusIconsActive[status]}</span>
                <span className="text">{status}</span>
              </li>
            ))}
          </ul>
        </BDPopover>
      )}
    </div>
  );
};

export default React.forwardRef(JobVisitConfirmationStatusSelector);