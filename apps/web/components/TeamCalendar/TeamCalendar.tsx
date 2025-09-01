'use client'

import React, { useState, useCallback, useMemo, useEffect, useRef, useContext } from 'react';
import { AvailabilityEvent, TeamMember } from '@/types';
import Popover, { PopoverProvider, PopoverContext } from '@/components/Popover';
import CalendarGrid from '@/components/CalendarGrid';
import EventEditor from '@/components/EventEditor';
import TeamMemberId from '@/components/TeamMemberId';
import TeamMembersData from '@/data/teamMembersData';
import AvailabilityEventsData from '@/data/availabilityEventsData';
import './TeamCalendar.scss';
import { c } from 'framer-motion/dist/types.d-Cjd591yU';

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
  const [showPopover, setShowPopover] = useState(false);
  const [popoverTarget, setPopoverTarget] = useState<{ current: HTMLElement | null }>({ current: null });
  const [activeEvent, setActiveEvent] = useState<AvailabilityEvent | null>(null);
  const [eventEditorValues, setEventEditorValues] = useState<Partial<AvailabilityEvent>>({});


  // Refs
  const { scrollContainerRef } = useContext(PopoverContext);

  const selectedTeamMembers = externalSelectedMembers || internalSelectedMembers;

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

  const handleEventClickFromGrid = useCallback((event: AvailabilityEvent, targetEl?: HTMLElement) => {
    // console.log('Event clicked from grid:', event, 'Target:', targetEl);
    if (targetEl) {
      // Create ref from the element
      setPopoverTarget({ current: targetEl });
      setActiveEvent(event);
      // Populate EventEditor with selected event data
      setEventEditorValues(event);
      setShowPopover(true);
    }
  }, []);

  const handleClosePopover = useCallback(() => {
    setShowPopover(false);
    setActiveEvent(null);
    setEventEditorValues({});
    setPopoverTarget({ current: null });
  }, []);

  const handleDayClick = useCallback((date: string) => {
    console.log('Day clicked:', date);
  }, []);

  const updateEventData = useCallback((data: Partial<AvailabilityEvent>) => {
    console.log('Event data updated:', data);
    setEventEditorValues(prev => ({ ...prev, ...data }));
    
    // TODO: Implement save functionality here
    // This is where you would:
    // 1. Validate the data
    // 2. Send to your API/backend
    // 3. Update your data store/state
    // 4. Show success/error feedback
    
    // Placeholder for save stub:
    console.log('STUB: Save event data to backend:', { ...eventEditorValues, ...data });
  }, [eventEditorValues]);

  return (
    <>
      <PopoverProvider scrollContainerRef={scrollContainerRef}>
        <div className={`team-calendar ${className}`}>
          <CalendarGrid 
            events={filteredEvents}
            onEventClick={handleEventClickFromGrid}
            onDayClick={handleDayClick}
            activeEvent={activeEvent}
            className="team-calendar__grid"
            showWeekends={false}
          />
          
          {/* Conditional popover rendering */}
          {showPopover && popoverTarget.current && (
            <Popover
              className="team-calendar__event-popover"
              targetRef={popoverTarget as React.RefObject<HTMLElement>}
              scrollContainerRef={scrollContainerRef as React.RefObject<HTMLDivElement>}
              position={'topLeft'}
              edge={'bottomLeft'}
              offset={{ x: 0, y: -20 }}
              onHide={handleClosePopover}
              closeButton={true}
              // noStyles={true}
            >
              {activeEvent && (
                <TeamMemberId 
                  teamMember={activeEvent.teamMember as TeamMember} 
                  avatarPlacement={'right'}
                />
              )}
              <EventEditor
                formConfig={[
                  // Hiding the Smart Event Editor for now. May put back, but would need some modding.
                  // {
                  //   component: 'smartEventInput',
                  //   props: {
                  //     placeholderText: '✨ Edit event details...'
                  //   }
                  // },
                  // 'teamMember',
                  'eventType',
                  'dateRange',
                  'allDaySwitch',
                  'timeRange',
                  'recurrence',
                  'monthlyRecurrence',
                ]}
                values={eventEditorValues}
                onChange={updateEventData}
              />
            </Popover>
          )}
        </div>
      </PopoverProvider>
    </>
  );
};

export default TeamCalendar;