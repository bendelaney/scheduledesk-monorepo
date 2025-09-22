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
  teamMembers = []
}) => {
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [hasInitiallyFocused, setHasInitiallyFocused] = useState(false);
  const initialLoadRef = useRef(true);
  const lastActiveEventIdRef = useRef<string | null>(null);

  // Use calendar UI context for save states
  const { saveStates, clearSaved } = useCalendarUI();
  const eventId = activeEvent?.id || 'new';
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

  useEffect(() => {
    // Only add listener when popover is shown
    if (!show) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Check for Enter key with Cmd/Ctrl modifier
      if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
        // Only trigger if save button would be active (no activeEvent, saveable, not currently saving)
        if (!activeEvent && isSaveable && onSave && !isSaving) {
          e.preventDefault();
          e.stopPropagation();
          handleSave();
        }
      }
    };

    // Add listener to capture phase to ensure we catch it
    document.addEventListener('keydown', handleKeyDown, true);
    return () => document.removeEventListener('keydown', handleKeyDown, true);
  }, [show, activeEvent, isSaveable, onSave, isSaving, handleSave]);

  if (!show || !target.current) {
    return null;
  }

  return (
    <Popover
      className={`calendar-popover ${className}`}
      targetRef={target as React.RefObject<HTMLElement>}
      position={(!activeEvent) ? 'bottomLeft' : 'centerRight'}
      edge={(!activeEvent) ? 'topLeft' : 'auto'}
      offset={(!activeEvent) ? { x: -8, y: 0 } : { x: 0, y: 0 }}
      closeButton={true}
      clickOutsideToClose={false}
      {...popoverProps}
      onShow={() => {
        // Only focus the SmartEventInput on initial render (for new events with smart input)
        if (!hasInitiallyFocused && !activeEvent) {
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
        {/* Show recurring event edit options for recurring instances */}
        {/* {activeEvent?.isInstance && (
          <>
            <Button
              disabled={saving}
              size="small"
              onClick={handleSave}
              className="calendar-popover__edit-instance-button"
            >
              {saving ? 'Saving...' : 'Edit This Instance'}
            </Button>
            <Button
              disabled={saving}
              size="small"
              onClick={() => {
                // TODO: Handle edit all instances
                console.log('Edit all instances clicked');
              }}
              className="calendar-popover__edit-all-button"
            >
              Edit All Instances
            </Button>
          </>
        )} */}

        {/* Show save button only for new events (no activeEvent) */}
        {!activeEvent && (
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
          ...(activeEvent ? [] : ['smartEventInput']),
          // Always include teamMember - it will be pre-populated for team member calendar
          ...(!activeEvent ? ['teamMember'] : [] ),
          // 'teamMember',
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
        teamMembers={teamMembers}
      />

      <div className="calendar-popover__footer-actions">
        <div className={`calendar-popover__save-indicator ${isSaving ? '-saving' : ''} ${isSaved ? '-saved' : ''}`}>
          <div className='saving-text'>Saving...</div>
          <div className='saved-icon'><CheckCircle/></div>
        </div>

        {activeEvent && onDelete && (
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