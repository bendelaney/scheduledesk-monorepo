'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter, usePathname, useParams } from 'next/navigation';
import AppFrame from '@/components/AppFrame';
import TeamMemberId from '@/components/TeamMemberId';
import TeamMemberCalendar from '@/components/TeamMemberCalendar';
import { AngleLeft } from '@/components/Icons';
import { useTeamMembers } from '@/lib/supabase/hooks/useTeamMembers';
import MainNavigationConfig from '@/config/MainNavigation';
import { TeamMember, AvailabilityEvent } from '@/types';
import CalendarPopover from '@/components/CalendarPopover';
import './TeamMemberPage.scss';

export default function TeamMemberPage() {
  const router = useRouter();
  const pathname = usePathname();
  
  const params = useParams();
  const memberId = params.memberId as string;
  const { data: teamMembers, loading, error } = useTeamMembers();
  
  const [teamMember, setTeamMember] = useState<TeamMember>();
  const [showPopover, setShowPopover] = useState(false);
  const [popoverIsSaveable, setPopoverIsSaveable] = useState(false);
  const [popoverTarget, setPopoverTarget] = useState<{ current: HTMLElement | null }>({ current: null });
  const [activeEvent, setActiveEvent] = useState<AvailabilityEvent | null>(null);
  const [eventEditorValues, setEventEditorValues] = useState<Partial<AvailabilityEvent>>({});

  useEffect(() => {
    if (teamMembers.length > 0) {
      console.log('Team members loaded, looking for memberId:', memberId);
      // Decode the URL-encoded memberId
      const decodedMemberId = decodeURIComponent(memberId);
      console.log('Decoded memberId:', decodedMemberId);

      // Find the team member by ID (or slug)
      const member = teamMembers.find(m =>
        m.id === memberId ||
        m.id === decodedMemberId ||
        `${m.firstName}-${m.lastName}`.toLowerCase() === memberId.toLowerCase() ||
        `${m.firstName}-${m.lastName}`.toLowerCase() === decodedMemberId.toLowerCase()
      );
      setTeamMember(member);
    }
  }, [memberId, teamMembers]);

  const handleNavigation = (path: string) => {
    router.push(path);
  };

  const handleEventClickFromGrid = useCallback((event: AvailabilityEvent, targetEl?: HTMLElement) => {
    if (targetEl) {
      setPopoverTarget({ current: targetEl });
      setActiveEvent(event);
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
    if (targetEl && teamMember) {
      setPopoverTarget({ current: targetEl });
      setActiveEvent(null);
      // Pre-populate with team member and date
      setEventEditorValues({
        startDate: date,
        endDate: date,
        teamMember: teamMember,
      });
      setShowPopover(true);
    }
  }, [teamMember]);

  const handleEventEditorChange = useCallback((data: Partial<AvailabilityEvent>) => {
    console.log('Event data updated:', data);
    setEventEditorValues(prev => ({ ...prev, ...data }));

    // TODO: Implement save functionality here
    console.log('STUB: Save event data to backend:', { ...eventEditorValues, ...data });
  }, [eventEditorValues]);
  
  return (
    <AppFrame
      className="team-member-page"
      topBarMiddleContent={
        <div className="top-bar__navigation">
          {MainNavigationConfig.map((navItem) => {
            const Icon = navItem.icon;
            const isActive = pathname === navItem.path;
            
            return (
              <button
                key={navItem.id}
                id={`main-nav-${navItem.id}`}
                className={`main-nav-button ${navItem.className} ${isActive ? 'active' : ''}`}
                onClick={() => handleNavigation(navItem.path)}
              >
                <Icon />
              </button>
            );
          })}
        </div>
      }
    > 
      <div className="team-member-header">
        <button aria-label="Back to team" title="Back to team" className="back-to-team" onClick={() => window.location.href = '/team'}><AngleLeft /></button>
        <div className="team-member-detail">
          {teamMember && 
            <TeamMemberId teamMember={teamMember} showName={true} showAvatar={true} />
          }
        </div>
      </div>

      {teamMember && (
        <TeamMemberCalendar
          teamMember={teamMember}
          onEventClick={handleEventClickFromGrid}
          onDayClick={handleDayClick}
          onNewEventClick={handleNewEventClick}
          activeEvent={activeEvent}
        />
      )}

      {/* Event Popover */}
      <CalendarPopover
        className='team-member-page__calendar-popover'
        show={showPopover}
        target={popoverTarget}
        activeEvent={activeEvent}
        eventEditorValues={eventEditorValues}
        onClose={handleClosePopover}
        onChange={handleEventEditorChange}
        onSaveableChange={setPopoverIsSaveable}
        isSaveable={popoverIsSaveable}
        showTeamMemberId={false}
      />
    </AppFrame>
  );
}