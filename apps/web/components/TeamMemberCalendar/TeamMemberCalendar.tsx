'use client'

import React from 'react';
import { AvailabilityEvent, TeamMember } from '@/types';
import CalendarGrid from '@/components/CalendarGrid';
import ErrorMessage from '@/components/ErrorMessage';
import LoadingSpinner from '@/components/LoadingSpinner';
import './TeamMemberCalendar.scss';

interface TeamMemberCalendarProps {
  className?: string;
  teamMember: TeamMember;
  onEventClick?: (event: AvailabilityEvent, targetElement?: HTMLElement) => void;
  onDayClick?: (date: string) => void;
  onNewEventClick?: (date: string, targetElement: HTMLElement) => void;
  activeEvent?: AvailabilityEvent | null;
  // Required: parent must provide events and loading state
  events: AvailabilityEvent[];
  loading: boolean;
  showLoading?: boolean;
  error: string | null;
}

const TeamMemberCalendar: React.FC<TeamMemberCalendarProps> = ({
  className = '',
  teamMember,
  onEventClick,
  onDayClick,
  onNewEventClick,
  activeEvent,
  events,
  loading,
  showLoading = true,
  error
}) => {

  if (showLoading && loading) {
    return (
      <div className={`team-member-calendar ${className} loading-state`}>
        <LoadingSpinner isLoading={loading} />
      </div>
    );
  }

  if (error) {
    return (
      <div className={`team-member-calendar ${className} error-state`}>
        <ErrorMessage error={`Error loading events: ${error}`} className="team-member-calendar__error" />
      </div>
    );
  }

  return (
    <div className={`team-member-calendar ${className} loaded-state`}>
      <CalendarGrid
        events={events}
        onEventClick={onEventClick}
        onDayClick={onDayClick}
        onNewEventClick={onNewEventClick}
        activeEvent={activeEvent}
        className="team-member-calendar__grid"
        showWeekends={false}
        showTeamMemberName={false}
      />
    </div>
  );
};

export default TeamMemberCalendar;