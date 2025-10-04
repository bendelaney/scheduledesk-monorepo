'use client'

import React, { useState, useRef, useEffect, useContext, FC, HTMLAttributes} from "react";
import { TeamMemberInstance } from "@/types";
import { useDragLock } from '@/components/DragDrop/DragDrop';
import BDPopover, { PopoverContext } from "@/components/Popover";
import { AngleDown, Duplicate, X } from "@/components/Icons";
import RotatingIcon from "@/components/RotatingIcon";
import TeamMemberHighlightMenu from "./TeamMemberHighlightMenu";
import "./TeamMemberBlock.scss";

interface TeamMemberBlockProps {
  id: string;
  className?: string;
  teamMember: TeamMemberInstance;
  isActive?: boolean;
  isSelected?: boolean;
  isClone?: boolean;
  highlightId?: string;
  onSelected?: (id: string) => void;
  onActive?: (id: string) => void;
  onHighlightChange?: (id: string, highlightId: string) => void;
  onRemove?: (id: string, teamMember: TeamMemberInstance) => void;
}

const TeamMemberBlock: FC<TeamMemberBlockProps> = ({
  id,
  className,
  teamMember,
  isActive,
  isSelected,
  isClone=false,
  onSelected,
  onActive,
  onHighlightChange,
  onRemove,
}) => {
  // State
  const [showHighlightMenu, setShowHighlightMenu] = useState(false);
  const [highlight, setHighlight] = useState(teamMember.highlightId || "");
  const [editableText, setEditableText] = useState(false);
  const [displayName, setDisplayName] = useState(teamMember.displayName || teamMember.member.firstName);
  const [blockActive, setBlockActive] = useState(isActive || false);
  const [inputWidth, setInputWidth] = useState("0px");
  const { isDragLocked, setIsDragLocked } = useDragLock();

  const origName = teamMember.member.firstName;
  // I like it better with just first name, but maybe we could include the option for last name initial or full last name...
  // const origName = teamMember.firstName + (teamMember.lastName ? " " + teamMember.lastName.charAt(0) + "." : "");

  // Refs
  const mainRef = useRef<HTMLDivElement>(null);
  const menuToggleRef = useRef<HTMLButtonElement>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);
  const { scrollContainerRef } = useContext(PopoverContext);

  // Handlers
  const handleBlockActive = (id: string) => {
    // on hold for now:
    // const newActiveState = !blockActive;
    // setBlockActive(newActiveState);

    // if (newActiveState) {  // Check the NEW state we're setting
    //   console.log('>>> TeamMemberBlock active. id:', id);
    //   onActive && onActive(id);
    // }
  };

  const handleSetHighlight = (highlightId: string) => {
    setHighlight(highlightId);
    teamMember.highlightId = highlightId;
    if (onHighlightChange) {
      onHighlightChange(id, highlightId);
    }
    setShowHighlightMenu(false);
  };

  const handleDisplayNameChange = () => {
    setEditableText(false);
    const newName = displayName;
    if (newName !== origName) {
      teamMember.displayName = newName;
      // console.log(`💾EDITED TEAM MEMBER DISPLAY NAME: teamMemberId:${teamMember.id} displayName:${newName}`);
    } else if (newName === origName) {
      teamMember.displayName = origName;
    }
  };

  const toggleHighlightMenu = () => {
    const newMenuState = !showHighlightMenu;
    setShowHighlightMenu(newMenuState);

    // Lock/unlock drag based on menu state
    if (newMenuState) {
      setIsDragLocked(true);
    } else {
      setIsDragLocked(false);
    }
  };

  // Effects
  useEffect(() => {
    if (isActive !== undefined) {
      setBlockActive(isActive);
    }
  }, [isActive]);

  useEffect(() => {
    if (editableText && nameInputRef.current) {
      nameInputRef.current.focus();
    }
  }, [editableText]);

  useEffect(() => {
    setInputWidth(`${displayName.length + 1}ch`);

    let newName = displayName.startsWith(origName) ? origName + displayName.slice(origName.length) : origName;

    if (newName !== displayName) {
      setDisplayName(newName);
    }
  }, [displayName]);

  useEffect(() => {
    // Cleanup function to ensure drag is unlocked when component unmounts
    return () => {
      if (showHighlightMenu) {
        setIsDragLocked(false);
      }
    };
  }, [showHighlightMenu, setIsDragLocked]);

  return (
    <div
      ref={mainRef}
      data-instance-id={id} // Add this line
      className={`team-member-block highlight-${highlight} ${blockActive ? "active" : ""} ${isSelected ? "selected" : ""} ${editableText ? "editable" : ""}  ${isClone ? "is-clone" : ""} ${className || ""} ${teamMember.isAnimatingIn ? "is-initially-hidden" : ""}`}
      onClick={e => {
        // Don't do anything on the containing div if menus are open or we're clicking interactive elements
        if (showHighlightMenu || editableText || e.target && (e.target as HTMLElement).closest('.no-drag')) {
          return;
        }

        // At this point, we know it's a click directly on the block (not a child element)
        e.stopPropagation();
        handleBlockActive(`${id}`);
      }}
    >
      {editableText ? (
        <div className="input-wrap">
          <input
            style={{ width: inputWidth }}
            ref={nameInputRef}
            type="text"
            value={displayName}
            onClick={e => e.stopPropagation()}
            onChange={e => setDisplayName(e.target.value)}
            onBlur={handleDisplayNameChange}
            onKeyDown={e => {
              if (e.key === 'Enter' || e.key === 'Escape') {
                e.preventDefault();
                (e.target as HTMLElement).blur();
              }
            }}
          />
        </div>
      ) : (
        <span className="team-member-name no-drag" onClick={(e) => {
          e.stopPropagation();
          setEditableText(true);
        }}>
          {displayName}
        </span>
      )}
      <button
        ref={menuToggleRef}
        className={`team-member-highlight-toggle no-drag ${showHighlightMenu ? "menu-active" : ""}`}
        onMouseDown={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          toggleHighlightMenu();
          e.nativeEvent.stopImmediatePropagation();
        }}
      >
        <RotatingIcon rotate={showHighlightMenu} degrees={180} icon={<AngleDown />} />
      </button>

      {showHighlightMenu && (
        <BDPopover
          targetRef={menuToggleRef}
          scrollContainerRef={scrollContainerRef}
          position={'bottomLeft'}
          edge={'topLeft'}
          offset={{ x: -14, y: 0 }}
          onHide={() => setShowHighlightMenu(false)}
          noStyles={true}
        >
          <TeamMemberHighlightMenu
            onSelect={handleSetHighlight}
            trigger={menuToggleRef}
            currentHighlight={highlight}
          />
        </BDPopover>
      )}

      <div className="action-buttons no-drag">
        <button
          className="remove-button"
          onClick={(e) => {
            e.stopPropagation();
            console.log("Remove team member:", teamMember);
            if (onRemove) {
              onRemove(id, teamMember);
            }
          }}
        >
          <X />
        </button>
      </div>
    </div>
  );
}

export default TeamMemberBlock;
