'use client'

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { AvailabilityEvent, TeamMember } from '@/types';
import Popover from '@/components/Popover';
import EventEditor from '@/components/EventEditor';
import TeamMemberId from '@/components/TeamMemberId';
import Button from '@/components/Button';
import ErrorMessage from '@/components/ErrorMessage';
import { CheckCircle } from '@/components/Icons';
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
  saving?: boolean;
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
  saving = false,
  teamMembers = []
}) => {
  const [showSaveIndicator, setShowSaveIndicator] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const initialLoadRef = useRef(true);
  const lastActiveEventIdRef = useRef<string | null>(null);
  
  const handleEventEditorChange = useCallback((data: Partial<AvailabilityEvent>) => {
    onChange(data);

    // Mark that user has made changes (not initial load)
    initialLoadRef.current = false;

    // Clear any existing error when user makes changes
    if (error) {
      setError(null);
    }
  }, [onChange, error]);

  // Auto-save effect that runs after parent state updates
  useEffect(() => {
    const currentEventId = activeEvent?.id ?? null;
    if (currentEventId !== lastActiveEventIdRef.current) {
      lastActiveEventIdRef.current = currentEventId;
      initialLoadRef.current = true;
    }

    // Skip if initial load, no active event, or already saving
    if (initialLoadRef.current || !activeEvent || saving || !onSave) {
      return;
    }

    const autoSave = async () => {
      try {
        console.log('Auto-saving existing event after state update...');
        await onSave();
        // Show save indicator only after successful save
        setShowSaveIndicator(true);
        setTimeout(() => {
          setShowSaveIndicator(false);
        }, 1000);
      } catch (err: any) {
        console.error('Auto-save failed:', err);
        setError(err.message || 'Failed to save changes');
      }
    };

    autoSave();
  }, [eventEditorValues, activeEvent, onSave, saving]);

  // Reset initial load flag when popover opens
  useEffect(() => {
    if (show) {
      initialLoadRef.current = true;
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
        // Only trigger if save button would be active (no activeEvent, saveable, not saving)
        if (!activeEvent && isSaveable && onSave && !saving) {
          e.preventDefault();
          e.stopPropagation();
          handleSave();
        }
      }
    };

    // Add listener to capture phase to ensure we catch it
    document.addEventListener('keydown', handleKeyDown, true);
    return () => document.removeEventListener('keydown', handleKeyDown, true);
  }, [show, activeEvent, isSaveable, onSave, saving, handleSave]);

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
        // Focus the SmartEventInput after popover is shown
        setTimeout(() => {
          const smartEventInput = document.querySelector('.calendar-popover .smart-event-input-input');
          if (smartEventInput) {
            (smartEventInput as HTMLElement).focus();
          }
        }, 0);
      }}
      onHide={onClose}
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
            disabled={!isSaveable || saving}
            size="small"
            onClick={handleSave}
            className="calendar-popover__save-button"
          >
            {saving ? 'Saving...' : 'Save'}
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
        {activeEvent && onDelete && (
          <Button
            disabled={saving}
            size="small"
            variant="ghost"
            onClick={async () => {
              if (onDelete && confirm('Are you sure you want to delete this event?')) {
                try {
                  setError(null);
                  await onDelete();
                } catch (err: any) {
                  console.error('Delete failed:', err);
                  setError(err.message || 'Failed to delete event');
                }
              }
            }}
            className="calendar-popover__delete-button"
          >
            {saving ? 'Deleting...' : 'Delete'}
          </Button>
        )}
      </div>
    </Popover>
  );
};

export default CalendarPopover;