'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname, useParams } from 'next/navigation';
import AppFrame from '@/components/AppFrame';
import TeamMemberId from '@/components/TeamMemberId';
import TeamMemberCalendar from '@/components/TeamMemberCalendar';
import { AngleLeft, AngleRight, Person } from '@/components/Icons';
import { CirclePlus } from '@/components/Icons';
import MainNavigationConfig from '@/config/MainNavigation';
import CalendarPopover from '@/components/CalendarPopover';
import { NormalScheduleEditor } from '@/components/NormalScheduleEditor';
import { useTeamMemberPageLogic } from '@/lib/hooks/useTeamMemberPageLogic';
import { CalendarUIProvider } from '@/contexts/CalendarUIContext';
import { useKeyboardShortcut } from '@/hooks/useKeyboardShortcut';
import './TeamMemberPage.scss';

function TeamMemberPageContent() {
  const router = useRouter();
  const pathname = usePathname();
  const [showNormalScheduleEditor, setShowNormalScheduleEditor] = useState(false);
  const [normalScheduleRefreshKey, setNormalScheduleRefreshKey] = useState(0);

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

  // 'n' key to create new event (Priority 20)
  useKeyboardShortcut(
    'n',
    () => {
      console.log('Key "n" pressed - opening new event popover');
      handleNewEventPopoverOpen();
    },
    20,
    [handleNewEventPopoverOpen],
    { id: 'team-member-new-event' }
  );
  
  return (
    <AppFrame
      className="team-member-page"
      showSidebarToggle={false}
      topBarLeftContent={
        <button
          ref={newEventButtonRef}
          className="new-event-button"
          onClick={handleNewEventPopoverOpen}
          title="Add new event - N"
        >
          <CirclePlus />
        </button>
      }
      topBarMiddleContent={
        <div className="top-bar__navigation">
          {MainNavigationConfig.map((navItem) => {
            const Icon = navItem.icon;
            const isActive = pathname === navItem.path;

            return (
              <React.Fragment key={navItem.id}>
                <button
                  id={`main-nav-${navItem.id}`}
                  className={`main-nav-button ${navItem.className} ${isActive ? 'active' : ''}`}
                  onClick={() => handleNavigation(navItem.path)}
                >
                  <Icon />
                </button>
                {navItem.id === 'team' && (
                  <>
                    <AngleRight className="nav-separator" />
                    <Person className="person-icon"/>
                  </>
                )}
              </React.Fragment>
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

        <button
          aria-label={`Edit ${teamMember?.firstName}'s Weekly Schedule`}
          title={`Edit ${teamMember?.firstName}'s Weekly Schedule`}
          className="btn btn--small btn--secondary edit-weekly-schedule"
          onClick={() => {
            if (showNormalScheduleEditor) {
              // Save logic here - for now just hide
              setShowNormalScheduleEditor(false);
            } else {
              setShowNormalScheduleEditor(true);
            }
          }}>
            {showNormalScheduleEditor ? 'Save Normal Schedule' : `Edit ${teamMember?.firstName}'s Normal Schedule`}
        </button>
      </div>

      {/* Normal Schedule Editor */}
      <div className={`normal-schedule-editor-wrapper ${showNormalScheduleEditor ? 'expanded' : 'collapsed'}`}>
        {teamMember && (
          <NormalScheduleEditor
            key={`normal-schedule-${normalScheduleRefreshKey}`}
            teamMember={teamMember}
            onEventClick={handleEventClickFromGrid}
            onDayClick={handleDayClick}
            onNewEventClick={handleNewEventClick}
            activeEvent={activeEvent}
          />
        )}
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
        isNormalSchedule={eventEditorValues.startDate?.startsWith('template-')}
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