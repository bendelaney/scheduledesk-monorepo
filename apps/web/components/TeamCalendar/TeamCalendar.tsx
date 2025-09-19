'use client'

import React, { useState, useMemo, useEffect } from 'react';
import { AvailabilityEvent } from '@/types';
import CalendarGrid from '@/components/CalendarGrid';
import './TeamCalendar.scss';
import TeamMembersData from '@/data/teamMembersData';
import AvailabilityEventsData from '@/data/availabilityEventsData';

interface TeamCalendarProps {
  className?: string;
  selectedTeamMembers?: string[];
  onSelectionChange?: (selected: string[]) => void;
  onEventClick?: (event: AvailabilityEvent, targetElement?: HTMLElement) => void;
  onDayClick?: (date: string) => void;
  onNewEventClick?: (date: string, targetElement: HTMLElement) => void;
  activeEvent?: AvailabilityEvent | null;
}

const TeamCalendar: React.FC<TeamCalendarProps> = ({
  className = '',
  selectedTeamMembers: externalSelectedMembers,
  onSelectionChange,
  onEventClick,
  onDayClick,
  onNewEventClick,
  activeEvent
}) => {
  const [internalSelectedMembers, setInternalSelectedMembers] = useState<string[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('teamCalendarSelection');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          return Array.isArray(parsed) ? parsed : TeamMembersData.map(m => m.displayName || `${m.firstName} ${m.lastName || ''}`.trim());
        } catch {
          return TeamMembersData.map(m => m.displayName || `${m.firstName} ${m.lastName || ''}`.trim());
        }
      }
    }
    return TeamMembersData.map(m => m.displayName || `${m.firstName} ${m.lastName || ''}`.trim());
  });

  const selectedTeamMembers = externalSelectedMembers || internalSelectedMembers;
  // Filter events for selected team members
  const filteredEvents = useMemo(() => {
    return AvailabilityEventsData.filter(event => {
      const fullName = `${event.teamMember.firstName} ${event.teamMember.lastName || ''}`.trim();
      return selectedTeamMembers.includes(fullName);
    });
  }, [selectedTeamMembers]);

  useEffect(() => {
    if (typeof window !== 'undefined' && !externalSelectedMembers) {
      localStorage.setItem('teamCalendarSelection', JSON.stringify(internalSelectedMembers));
    }
  }, [internalSelectedMembers, externalSelectedMembers]);

  return (
    <div className={`team-calendar ${className}`}>
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