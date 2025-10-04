import React, { FC, useEffect, useRef } from "react";
import teamMemberHighlights from "@/data/teamMemberHighlightsData";
import { X } from "@/components/Icons";
import "./TeamMemberHighlightMenu.scss";

// import useClickOutside from 'hooks/useClickOutside';

// Define the TeamMemberHighlightMenuProps type
interface TeamMemberHighlightMenuProps {
  trigger: React.RefObject<HTMLElement | null>;
  currentHighlight?: string;
  onSelect: (highlight: string) => void;
  onClose?: () => void;
}

export const TeamMemberHighlightMenu: FC<TeamMemberHighlightMenuProps> = ({
  trigger,
  currentHighlight = "",
  onSelect = () => {},
  onClose,
}) => {
  const handleSelection = (highlightId: string) => {
    const newHighlight = highlightId === currentHighlight ? "" : highlightId;
    onSelect(newHighlight);
    onClose && onClose();
  };

  return (
    <ul
      className="team-member-highlight-menu">
      {teamMemberHighlights.map((h) => (
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
          <div className="highlight-box">
            {h.id === currentHighlight ? <X/> : ''}
          </div>
          <span>{h.name}</span>
        </li>
      ))}
    </ul>
  );
}

export default TeamMemberHighlightMenu;
