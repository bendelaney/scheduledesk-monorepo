'use client'

import React, { useMemo } from 'react';
import { AvailabilityEvent } from '@/types';
import CalendarGrid from '@/components/CalendarGrid';
import ErrorMessage from '@/components/ErrorMessage';
import './TeamCalendar.scss';
import LoadingSpinner from '@/components/LoadingSpinner';

interface TeamCalendarProps {
  className?: string;
  selectedTeamMembers: string[];
  onSelectionChange?: (selected: string[]) => void;
  onEventClick?: (event: AvailabilityEvent, targetElement?: HTMLElement) => void;
  onDayClick?: (date: string) => void;
  onNewEventClick?: (date: string, targetElement: HTMLElement) => void;
  activeEvent?: AvailabilityEvent | null;
  // Required: parent must provide events and loading state
  events: AvailabilityEvent[];
  loading: boolean;
  error: string | null;
}

const TeamCalendar: React.FC<TeamCalendarProps> = ({
  className = '',
  selectedTeamMembers,
  onSelectionChange,
  onEventClick,
  onDayClick,
  onNewEventClick,
  activeEvent,
  events,
  loading,
  error
}) => {

  // Filter events for selected team members
  const filteredEvents = useMemo(() => {
    const filtered = events.filter(event => {
      // console.log('TeamCalendar event.teamMember:', event.teamMember);
      const fullName = `${event.teamMember.firstName} ${event.teamMember.lastName || ''}`.trim();
      const isSelected = selectedTeamMembers.includes(fullName);
      // console.log('TeamCalendar filtering:', { fullName, isSelected, selectedTeamMembers });
      return isSelected;
    });
    // console.log('TeamCalendar - Filtered events:', filtered.length, 'from', events.length, 'total');
    return filtered;
  }, [selectedTeamMembers, events]);

  // Show loading state
  if (loading) {
    return (
      <div className={`team-calendar ${className} loading-state`}>
        <LoadingSpinner isLoading={loading} />
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className={`team-calendar ${className} error-state`}>
        <ErrorMessage
          error={error}
          className="team-calendar__error"
        />
      </div>
    );
  }

  return (
    <div className={`team-calendar ${className} loaded-state`}>
      <CalendarGrid
        events={filteredEvents}
        onEventClick={onEventClick}
        onDayClick={onDayClick}
        onNewEventClick={onNewEventClick}
        activeEvent={activeEvent}
        className="team-calendar__grid"
        showWeekends={false}
      />
    </div>
  );
};

export default TeamCalendar;