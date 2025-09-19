'use client'

import React, { useMemo } from 'react';
import { AvailabilityEvent, TeamMember } from '@/types';
import CalendarGrid from '@/components/CalendarGrid';
import './TeamMemberCalendar.scss';
import AvailabilityEventsData from '@/data/availabilityEventsData';

interface TeamMemberCalendarProps {
  className?: string;
  teamMember: TeamMember;
  onEventClick?: (event: AvailabilityEvent, targetElement?: HTMLElement) => void;
  onDayClick?: (date: string) => void;
  onNewEventClick?: (date: string, targetElement: HTMLElement) => void;
  activeEvent?: AvailabilityEvent | null;
}

const TeamMemberCalendar: React.FC<TeamMemberCalendarProps> = ({
  className = '',
  teamMember,
  onEventClick,
  onDayClick,
  onNewEventClick,
  activeEvent
}) => {
  // Filter events for this specific team member
  const filteredEvents = useMemo(() => {
    return AvailabilityEventsData.filter(event => {
      return event.teamMember.id === teamMember.id;
    });
  }, [teamMember.id]);

  return (
    <div className={`team-member-calendar ${className}`}>
      <CalendarGrid
        events={filteredEvents}
        onEventClick={onEventClick}
        onDayClick={onDayClick}
        onNewEventClick={onNewEventClick}
        activeEvent={activeEvent}
        className="team-member-calendar__grid"
        showWeekends={true}
        showTeamMemberName={false}
      />
    </div>
  );
};

export default TeamMemberCalendar;