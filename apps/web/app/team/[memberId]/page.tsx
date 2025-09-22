'use client';

import { useEffect } from 'react';
import { useRouter, usePathname, useParams } from 'next/navigation';
import AppFrame from '@/components/AppFrame';
import TeamMemberId from '@/components/TeamMemberId';
import TeamMemberCalendar from '@/components/TeamMemberCalendar';
import { AngleLeft } from '@/components/Icons';
import PlusCircle from '@/components/Icons/PlusCircle';
import MainNavigationConfig from '@/config/MainNavigation';
import CalendarPopover from '@/components/CalendarPopover';
import { useTeamMemberPageLogic } from '@/lib/hooks/useTeamMemberPageLogic';
import { CalendarUIProvider } from '@/contexts/CalendarUIContext';
import './TeamMemberPage.scss';

function TeamMemberPageContent() {
  const router = useRouter();
  const pathname = usePathname();

  const params = useParams();
  const memberId = params.memberId as string;

  // Use custom hook to get all data and handlers (now inside the provider)
  const {
    teamMember,
    teamMembers,
    availabilityEvents,
    loading,
    error,
    showPopover,
    popoverIsSaveable,
    popoverTarget,
    activeEvent,
    eventEditorValues,
    newEventButtonRef,
    handleEventClickFromGrid,
    handleClosePopover,
    handleDayClick,
    handleNewEventClick,
    handleNewEventPopoverOpen,
    handleEventEditorChange,
    handleSaveEvent,
    handleDeleteEvent,
    setPopoverIsSaveable,
  } = useTeamMemberPageLogic(memberId);

  const handleNavigation = (path: string) => {
    router.push(path);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'n' && (!e.metaKey || !e.ctrlKey)) {
        e.preventDefault();
        console.log('Key "n" pressed - opening new event popover');
        handleNewEventPopoverOpen();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleNewEventPopoverOpen]);
  
  return (
    <AppFrame
      className="team-member-page"
      showSidebarToggle={false}
      topBarLeftContent={
        <button
          ref={newEventButtonRef}
          className="new-event-button"
          onClick={handleNewEventPopoverOpen}
          title="Add new event"
        >
          <PlusCircle />
        </button>
      }
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

        <button aria-label="Edit Normal Weekly Schedule" title="Edit Normal Weekly Schedule" className="btn btn--small btn--secondary edit-weekly-schedule" onClick={()=>{}}>Edit Normal Weekly Schedule</button>
      </div>

      {teamMember && (
        <TeamMemberCalendar
          teamMember={teamMember}
          onEventClick={handleEventClickFromGrid}
          onDayClick={handleDayClick}
          onNewEventClick={handleNewEventClick}
          activeEvent={activeEvent}
          events={availabilityEvents}
          loading={loading}
          showLoading={false}
          error={error || null}
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
        showTeamMemberId={true}
        onSave={handleSaveEvent}
        onDelete={handleDeleteEvent}
        teamMembers={teamMembers}
      />
      </AppFrame>
  );
}

export default function TeamMemberPage() {
  return (
    <CalendarUIProvider>
      <TeamMemberPageContent />
    </CalendarUIProvider>
  );
}