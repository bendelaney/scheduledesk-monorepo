import React, { FC, useEffect, useRef } from "react";
import jobHighlights from "@/data/jobHighlightsData";
import { X } from "@/components/Icons";
import "./JobHighlightMenu.scss";

// not using this now in favor of BDPopover, which handles it.
// import useClickOutside from 'hooks/useClickOutside';

// Define the JobHighlightMenuProps type
interface JobHighlightMenuProps {
  trigger: React.RefObject<HTMLElement>;
  currentHighlight?: string;
  onSelect: (highlight: string) => void;
  onClose?: () => void;
}

export const JobHighlightMenu: FC<JobHighlightMenuProps> = ({
  trigger,
  currentHighlight = "",
  onSelect,
  onClose
}) => {
  const handleSelection = (highlightId: string) => {
    const newHighlight = highlightId === currentHighlight ? "" : highlightId;
    onSelect(newHighlight);
    onClose && onClose();
  };

  return (
    <ul className="job-highlight-menu">
      {jobHighlights.map((h) => (
        <li
          className={`highlight-${h.id} ${h.id === currentHighlight ? 'selected' : ''}`}
          key={h.id}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleSelection(h.id);
            e.nativeEvent.stopImmediatePropagation();
          }}
        >
          <span>{h.name}</span>
          <div className="highlight-box">
            {h.id === currentHighlight ? <X/> : ''}
          </div>
        </li>
      ))}
    </ul>
  );
}

export default JobHighlightMenu;
