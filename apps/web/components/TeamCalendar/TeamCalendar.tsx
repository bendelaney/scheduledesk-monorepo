'use client'

import React, { useState, useCallback, useMemo, useEffect, useRef, useContext } from 'react';
import { useRouter } from 'next/navigation';
import { AvailabilityEvent, TeamMember } from '@/types';
import Popover, { PopoverProvider, PopoverContext } from '@/components/Popover';
import CalendarGrid from '@/components/CalendarGrid';
import EventEditor from '@/components/EventEditor';
import TeamMemberId from '@/components/TeamMemberId';
import TeamMembersData from '@/data/teamMembersData';
import AvailabilityEventsData from '@/data/availabilityEventsData';
import './TeamCalendar.scss';
import { CheckCircle } from '@/components/Icons';

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
  const router = useRouter();

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
  const [showPopoverSaveIndicator, setShowPopoverSaveIndicator] = useState(false);


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

  const handleNewEventClick = useCallback((date: string, targetEl: HTMLElement) => {
    console.log('New event clicked for date:', date, 'Target:', targetEl);
    if (targetEl) {
      // Create ref from the element
      setPopoverTarget({ current: targetEl });
      setActiveEvent(null); // No existing event for new events
      // Initialize EventEditor with the selected date
      setEventEditorValues({
        startDate: date,
        endDate: date,
      });
      setShowPopover(true);
    }
  }, []);

  const handleTeamMemberClick = (member: TeamMember) => {
    // Navigate using member ID or create a slug
    const memberSlug = `${member.firstName}-${member.lastName}`.toLowerCase();
    router.push(`/team/${memberSlug}`);
  };

  const handleEventEditorChange = useCallback((data: Partial<AvailabilityEvent>) => {
    console.log('Event data updated:', data);
    setEventEditorValues(prev => ({ ...prev, ...data }));
    
    // Trigger save indicator animation
    setShowPopoverSaveIndicator(true);
    setTimeout(() => {
      setShowPopoverSaveIndicator(false);
    }, 1000);

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
            onNewEventClick={handleNewEventClick}
            activeEvent={activeEvent}
            className="team-calendar__grid"
            showWeekends={false}
          />
          
          {/* Conditional popover rendering */}
          {showPopover && popoverTarget.current && (
            <Popover
              className={`team-calendar__${activeEvent ? 'event' : 'new-event'}-popover`}
              targetRef={popoverTarget as React.RefObject<HTMLElement>}
              scrollContainerRef={scrollContainerRef as React.RefObject<HTMLDivElement>}
              position={'topLeft'}
              edge={'bottomLeft'}
              offset={{ x: 0, y: -20 }}
              onShow={() => {
                // Focus the SmartEventInput after popover is shown
                setTimeout(() => {
                  const smartEventInput = document.querySelector('.team-calendar__new-event-popover .smart-event-input-input');
                  if (smartEventInput) {
                    (smartEventInput as HTMLElement).focus();
                  }
                }, 0);
              }}
              onHide={handleClosePopover}
              closeButton={true}
              // noStyles={true}
            >
              {
                <div className={`team-calendar__popover-saved-indicator ${showPopoverSaveIndicator ? 'visible' : ''}`}>
                  <CheckCircle/>
                </div>
              }
              {activeEvent && (
                <TeamMemberId 
                  teamMember={activeEvent.teamMember as TeamMember} 
                  avatarPlacement={'right'}
                  onClick={() => handleTeamMemberClick(activeEvent.teamMember as TeamMember)}
                />
              )}
              <EventEditor
                formConfig={[
                  // Include SmartEventInput for new events
                  ...(activeEvent ? [] : [{
                    component: 'smartEventInput',
                    props: {
                      placeholderText: '✨ Create new event...'
                    }
                  }]),
                  'teamMember',
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
              />
            </Popover>
          )}
        </div>
      </PopoverProvider>
    </>
  );
};

export default TeamCalendar;