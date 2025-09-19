'use client'

import React, { useState, useCallback } from 'react';
import { AvailabilityEvent, TeamMember } from '@/types';
import Popover from '@/components/Popover';
import EventEditor from '@/components/EventEditor';
import TeamMemberId from '@/components/TeamMemberId';
import Button from '@/components/Button';
import { CheckCircle } from '@/components/Icons';
import './CalendarPopover.scss';

interface CalendarPopoverProps {
  className?: string;
  show: boolean;
  target: { current: HTMLElement | null };
  activeEvent: AvailabilityEvent | null;
  eventEditorValues: Partial<AvailabilityEvent>;
  onClose: () => void;
  onChange: (data: Partial<AvailabilityEvent>) => void;
  onSaveableChange: (saveable: boolean) => void;
  isSaveable: boolean;
  showTeamMemberId?: boolean;
}

const CalendarPopover: React.FC<CalendarPopoverProps> = ({
  className = '',
  show,
  target,
  activeEvent,
  eventEditorValues,
  onClose,
  onChange,
  onSaveableChange,
  isSaveable,
  showTeamMemberId = true
}) => {
  const [showSaveIndicator, setShowSaveIndicator] = useState(false);

  const handleEventEditorChange = useCallback((data: Partial<AvailabilityEvent>) => {
    onChange(data);

    // Trigger save indicator animation
    setShowSaveIndicator(true);
    setTimeout(() => {
      setShowSaveIndicator(false);
    }, 1000);
  }, [onChange]);

  if (!show || !target.current) {
    return null;
  }

  return (
    <Popover
      className={`calendar-popover ${className}`}
      targetRef={target as React.RefObject<HTMLElement>}
      position={'topLeft'}
      edge={'bottomLeft'}
      offset={{ x: 0, y: -20 }}
      onShow={() => {
        // Focus the SmartEventInput after popover is shown
        setTimeout(() => {
          const smartEventInput = document.querySelector('.calendar-popover .smart-event-input-input');
          if (smartEventInput) {
            (smartEventInput as HTMLElement).focus();
          }
        }, 0);
      }}
      onHide={onClose}
      closeButton={true}
    >
      <div className={`calendar-popover__saved-indicator ${showSaveIndicator ? 'visible' : ''}`}>
        <CheckCircle/>
      </div>

      {activeEvent && showTeamMemberId && (
        <TeamMemberId
          teamMember={activeEvent.teamMember as TeamMember}
          avatarPlacement={'right'}
          onClick={() => {
            window.location.href = `/team/${(activeEvent.teamMember as TeamMember).firstName}-${(activeEvent.teamMember as TeamMember).lastName}`;
          }}
        />
      )}

      {!activeEvent && (
        <Button
          disabled={!isSaveable}
          size="small"
          onClick={() => {
            if (isSaveable) {
              console.log('STUB: Save new event:', eventEditorValues);
            }
          }}
          className="calendar-popover__save-button"
        >
          Save
        </Button>
      )}

      <EventEditor
        formConfig={[
          // Include SmartEventInput for new events
          ...(activeEvent ? [] : ['smartEventInput']),
          // Always include teamMember - it will be pre-populated for team member calendar
          ...(showTeamMemberId ? ['teamMember'] : []),
          'eventType',
          'customEventNameInput',
          'dateRange',
          'allDaySwitch',
          'timeRange',
          'recurrence',
          'monthlyRecurrence',
        ]}
        values={eventEditorValues}
        onChange={handleEventEditorChange}
        onSaveableChange={onSaveableChange}
      />
    </Popover>
  );
};

export default CalendarPopover;