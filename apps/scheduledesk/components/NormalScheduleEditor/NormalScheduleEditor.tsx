'use client';

import { useCallback, useEffect } from 'react';
import { TeamMember, AvailabilityEvent } from '@/types';
import { WeekView } from '@/components/WeekView';
import { useNormalSchedule } from '@/hooks/useNormalSchedule';
import './NormalScheduleEditor.scss';

interface NormalScheduleEditorProps {
  teamMember: TeamMember;
  onEventClick?: (event: AvailabilityEvent, targetElement?: HTMLElement) => void;
  onDayClick?: (date: string) => void;
  onNewEventClick?: (date: string, targetElement: HTMLElement) => void;
  activeEvent?: AvailabilityEvent | null;
  key?: string; // Allow parent to force re-render by changing key
}

const NormalScheduleEditor: React.FC<NormalScheduleEditorProps> = ({
  teamMember,
  onEventClick,
  onDayClick,
  onNewEventClick,
  activeEvent
}) => {
  const { events: templateEvents, loading, error } = useNormalSchedule(teamMember?.id || '', teamMember);

  // Remove automatic refresh on popover close to prevent flashing
  // The hook already handles updating events when they're saved/deleted
  // useEffect(() => {
  //   if (showPopover === false) {
  //     console.log('NormalScheduleEditor: Popover closed, refreshing events...');
  //     setTimeout(refreshEvents, 100);
  //   }
  // }, [showPopover, refreshEvents]);

  // Debug: log current events to help troubleshoot
  useEffect(() => {
    console.log('NormalScheduleEditor: templateEvents updated:', templateEvents);
  }, [templateEvents]);

  const handleEventClick = useCallback((event: AvailabilityEvent, targetElement?: HTMLElement) => {
    onEventClick?.(event, targetElement);
  }, [onEventClick]);

  const handleDayClick = useCallback((date: string) => {
    onDayClick?.(date);
  }, [onDayClick]);

  const handleNewEventClick = useCallback((date: string, targetElement: HTMLElement) => {
    onNewEventClick?.(date, targetElement);
  }, [onNewEventClick]);

  if (loading) {
    return (
      <div className="normal-schedule-editor">
        <div className="normal-schedule-editor__loading">Loading normal schedule...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="normal-schedule-editor">
        <div className="normal-schedule-editor__error">Error loading schedule: {error}</div>
      </div>
    );
  }

  return (
    <div className="normal-schedule-editor">
      <div className="normal-schedule-editor__header">
        <h3>Normal Weekly Schedule for {teamMember.firstName}</h3>
        <p className="normal-schedule-editor__description">
          Click on any day to add working hours, appointments, or other recurring schedule items.
        </p>
      </div>

      <div className="normal-schedule-editor__calendar">
        <WeekView
          events={templateEvents}
          onEventClick={handleEventClick}
          onDayClick={handleDayClick}
          onNewEventClick={handleNewEventClick}
          activeEvent={activeEvent}
          className="normal-schedule-week-view"
        />
      </div>
    </div>
  );
};

export default NormalScheduleEditor;