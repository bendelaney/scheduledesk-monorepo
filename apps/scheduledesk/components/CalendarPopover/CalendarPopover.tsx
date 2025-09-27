'use client'

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { AvailabilityEvent, TeamMember } from '@/types';
import Popover from '@/components/Popover';
import EventEditor from '@/components/EventEditor';
import TeamMemberId from '@/components/TeamMemberId';
import Button from '@/components/Button';
import ErrorMessage from '@/components/ErrorMessage';
import { CheckCircle } from '@/components/Icons';
import { useCalendarUI } from '@/contexts/CalendarUIContext';
import { useEnterKey } from '@/hooks/useKeyboardShortcut';
import './CalendarPopover.scss';

type PopoverProps = React.ComponentProps<typeof Popover>;

interface CalendarPopoverProps {
  className?: string;
  show: boolean;
  target: React.RefObject<HTMLElement | null>;
  popoverProps?: Omit<PopoverProps, 'className' | 'children' | 'onShow' | 'onHide' | 'targetRef'>;
  // Event data and handlers
  activeEvent: AvailabilityEvent | null;
  eventEditorValues: Partial<AvailabilityEvent>;
  onClose: () => void;
  onChange: (data: Partial<AvailabilityEvent>) => void;
  onSaveableChange: (saveable: boolean) => void;
  isSaveable: boolean;
  showTeamMemberId?: boolean;
  onSave?: () => Promise<void>;
  onDelete?: () => Promise<void>;
  teamMembers?: { firstName: string; lastName: string; id: string }[];
  isNormalSchedule?: boolean; // Flag for normal schedule events
}

const CalendarPopover: React.FC<CalendarPopoverProps> = ({
  className = '',
  show,
  target,
  popoverProps = {},
  activeEvent,
  eventEditorValues,
  onClose,
  onChange,
  onSaveableChange,
  isSaveable,
  showTeamMemberId = true,
  onSave,
  onDelete,
  teamMembers = [],
  isNormalSchedule = false
}) => {
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [hasInitiallyFocused, setHasInitiallyFocused] = useState(false);
  const initialLoadRef = useRef(true);
  const lastActiveEventIdRef = useRef<string | null>(null);

  // Use calendar UI context for save states
  const { saveStates, clearSaved } = useCalendarUI();

  // Helper to determine if this is an existing event (including expanded normal schedule events)
  const isExistingEvent = Boolean(
    activeEvent?.id ||
    (activeEvent?.isExpandedNormalSchedule && activeEvent?.originalEventId)
  );

  // Treat expanded normal schedule events as existing events using originalEventId
  const eventId = activeEvent?.id ||
                  (activeEvent?.isExpandedNormalSchedule && activeEvent?.originalEventId) ||
                  'new';
  const isSaving = saveStates.saving === eventId;
  const isSaved = saveStates.saved === eventId;

  
  const handleEventEditorChange = useCallback((data: Partial<AvailabilityEvent>) => {
    onChange(data);

    // Mark that user has made changes (not initial load)
    initialLoadRef.current = false;

    // Clear any existing error when user makes changes
    if (error) {
      setError(null);
    }

    // Clear saved state when user makes changes
    if (isSaved) {
      clearSaved();
    }
  }, [onChange, error, isSaved, clearSaved]);

  // Track when activeEvent changes to reset initial load flag
  useEffect(() => {
    const currentEventId = activeEvent?.id ?? null;
    if (currentEventId !== lastActiveEventIdRef.current) {
      lastActiveEventIdRef.current = currentEventId;
      initialLoadRef.current = true;
      setHasInitiallyFocused(false); // Reset focus flag for new event
    }
  }, [activeEvent?.id]);

  // Reset initial load flag and focus flag when popover opens
  useEffect(() => {
    if (show) {
      initialLoadRef.current = true;
      setHasInitiallyFocused(false);
    }
  }, [show, activeEvent?.id]);

  const handleSave = useCallback(async () => {
    console.log('Save handler called. isSaveable:', isSaveable, 'onSave:', !!onSave);
    console.log('Event data to save:', eventEditorValues);

    if (isSaveable && onSave) {
      try {
        setError(null);
        console.log('Calling onSave...');
        await onSave();
        console.log('Save completed successfully');
      } catch (err: any) {
        console.error('Save failed:', err);
        setError(err.message || 'Failed to save event');
      }
    } else {
      console.log('Save not triggered - isSaveable:', isSaveable, 'onSave available:', !!onSave);
    }
  }, [isSaveable, onSave, eventEditorValues]);

  // Register Cmd+Enter shortcut for saving events with high priority (100)
  useEnterKey(
    () => {
      // Only trigger if popover is shown and save conditions are met
      if (show && !isExistingEvent && isSaveable && onSave && !isSaving) {
        handleSave();
      }
    },
    100,
    [show, isExistingEvent, isSaveable, onSave, isSaving, handleSave],
    { meta: true, id: 'calendar-popover-save' }
  );

  if (!show || !target.current) {
    return null;
  }

  return (
    <Popover
      className={`calendar-popover ${className}`}
      targetRef={target as React.RefObject<HTMLElement>}
      position={(!isExistingEvent) ? 'bottomLeft' : 'centerRight'}
      edge={(!isExistingEvent) ? 'topLeft' : 'auto'}
      offset={(!isExistingEvent) ? { x: -8, y: 0 } : { x: 0, y: 0 }}
      closeButton={true}
      clickOutsideToClose={false}
      {...popoverProps}
      onShow={() => {
        // Only focus the SmartEventInput on initial render (for new events with smart input)
        if (!hasInitiallyFocused && !isExistingEvent) {
          setTimeout(() => {
            const smartEventInput = document.querySelector('.calendar-popover .smart-event-input-input');
            if (smartEventInput) {
              (smartEventInput as HTMLElement).focus();
              setHasInitiallyFocused(true);
            }
          }, 0);
        }
      }}
      onHide={onClose}
      >
      {activeEvent && showTeamMemberId && (
        <TeamMemberId
          teamMember={activeEvent.teamMember as TeamMember}
          avatarPlacement={'right'}
          onClick={() => {
            window.location.href = `/team/${(activeEvent.teamMember as TeamMember).firstName}-${(activeEvent.teamMember as TeamMember).lastName}`;
          }}
        />
      )}

      <div className="calendar-popover__header-actions">
        {/* Show save button only for new events (no existing event) */}
        {!isExistingEvent && (
          <Button
            disabled={!isSaveable || isSaving}
            size="small"
            onClick={handleSave}
            className="calendar-popover__save-button"
          >
            {isSaving ? 'Saving...' : 'Save'}
          </Button>
        )}
      </div>

      <ErrorMessage error={error} className="calendar-popover__error" />

      <EventEditor
        formConfig={[
          // Include SmartEventInput for new events
          ...(isExistingEvent ? [] : ['smartEventInput']),
          // Always include teamMember - it will be pre-populated for team member calendar
          ...(!isExistingEvent ? ['teamMember'] : [] ),
          // 'teamMember',
          'eventType',
          'customEventNameInput',
          // Always include dateRange (now supports normal schedule events)
          'dateRange',
          'allDaySwitch',
          'timeRange',
          'recurrence',
          'monthlyRecurrence',
        ]}
        values={eventEditorValues}
        onChange={handleEventEditorChange}
        onSaveableChange={onSaveableChange}
        teamMembers={teamMembers}
        isNormalSchedule={isNormalSchedule}
      />

      <div className="calendar-popover__footer-actions">
        <div className={`calendar-popover__save-indicator ${isSaving ? '-saving' : ''} ${isSaved ? '-saved' : ''}`}>
          <div className='saving-text'>Saving...</div>
          <div className='saved-icon'><CheckCircle/></div>
        </div>

        {isExistingEvent && onDelete && (
          <Button
            disabled={deleting || isSaving}
            size="small"
            variant="ghost"
            onClick={async () => {
              if (onDelete && confirm('Are you sure you want to delete this event?')) {
                try {
                  setError(null);
                  setDeleting(true);
                  await onDelete();
                } catch (err: any) {
                  console.error('Delete failed:', err);
                  setError(err.message || 'Failed to delete event');
                } finally {
                  setDeleting(false);
                }
              }
            }}
            className="calendar-popover__delete-button"
          >
            {deleting ? 'Deleting...' : 'Delete'}
          </Button>
        )}
      </div>
    </Popover>
  );
};

export default CalendarPopover;