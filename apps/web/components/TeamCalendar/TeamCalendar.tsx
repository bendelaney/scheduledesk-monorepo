'use client'

import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { AvailabilityEvent } from '../../types';
import CalendarGrid from '../CalendarGrid';
import TeamMembersData from '../../data/teamMembersData';
import AvailabilityEventsData from '../../data/availabilityEventsData';
import './TeamCalendar.scss';

interface TeamCalendarProps {
  className?: string;
  selectedTeamMembers?: string[];
  onSelectionChange?: (selected: string[]) => void;
}

const TeamCalendar: React.FC<TeamCalendarProps> = ({
  className = '',
  selectedTeamMembers: externalSelectedMembers,
  onSelectionChange
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

  const filteredEvents = useMemo(() => {
    return AvailabilityEventsData.filter(event => 
      selectedTeamMembers.includes(event.teamMember)
    );
  }, [selectedTeamMembers]);

  useEffect(() => {
    if (typeof window !== 'undefined' && !externalSelectedMembers) {
      localStorage.setItem('teamCalendarSelection', JSON.stringify(internalSelectedMembers));
    }
  }, [internalSelectedMembers, externalSelectedMembers]);

  const handleEventClickFromGrid = useCallback((event: AvailabilityEvent, targetEl?: HTMLElement) => {
    console.log('Event clicked from grid:', event, 'Target:', targetEl);
  }, []);

  const handleDayClick = useCallback((date: string) => {
    console.log('Day clicked:', date);
  }, []);

  return (
    <div className={`team-calendar ${className}`}>
      <CalendarGrid 
        events={filteredEvents}
        onEventClick={handleEventClickFromGrid}
        onDayClick={handleDayClick}
        className="team-calendar__grid"
      />
    </div>
  );
};

export default TeamCalendar;