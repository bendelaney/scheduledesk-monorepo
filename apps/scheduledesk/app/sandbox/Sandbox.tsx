'use client';

import React, { useState, useCallback } from 'react';
import AppFrame from '@/components/AppFrame';
import TeamCalendar from '@/components/TeamCalendar';
import TeamMemberList from '@/components/TeamMemberList';
import TeamMembersData from '@/data/teamMembersData';
import { AvailabilityEvent, RecurrenceType, EventTypeName } from '@/types';
import './page.scss';
import { DateTime } from 'luxon';
import EventEditor from '@/components/EventEditor';
import DataViewer from '@/components/DataViewer';

export default function Sandbox() {
  const [selectedTeamMembers, setSelectedTeamMembers] = useState<string[]>(
    TeamMembersData.map(m => m.displayName || `${m.firstName} ${m.lastName || ''}`.trim())
  );

  const handleSelectionChange = (selected: string[]) => {
    console.log('Team member selection changed:', selected);
    setSelectedTeamMembers(selected);
  };

  const handleTeamMemberFilter = useCallback((filter: string) => {
    console.log('Team member filter changed:', filter);
    console.log('Selected Members', selectedTeamMembers);
  }, []);

  const currentDate = DateTime.now().toISODate();
  const teamMemberList = TeamMembersData.map((member) => (member.firstName + " " + member.lastName));

  const defaultEvent: AvailabilityEvent[] = [{
    teamMember: {
      firstName: "Ben",
      lastName: "Delaney",
    },
    eventType: "Personal Appointment" as EventTypeName, // Add type assertion here
    recurrence: "Every Week" as RecurrenceType, // Add type assertion here
    startDate: currentDate,
    allDay: false,
    startTime: "07:00:00",
    endTime: "13:00:00",
  }];
  const [eventEditorOutput, setEventEditorOutput] = useState<AvailabilityEvent[]>(defaultEvent);
  const [eventEditorValues, setEventEditorValues] = useState<AvailabilityEvent>(defaultEvent[0]);

  // // Helper function to safely update event editor values
  const updateEventData = useCallback((data: Partial<AvailabilityEvent>) => {
    console.log("EventEditor onChange called with:", data);
    setEventEditorOutput([data] as AvailabilityEvent[]);
  }, []);



  return (
    // <AppFrame 
    //   sidebar={
    //     <TeamMemberList 
    //       teamMembers={TeamMembersData}
    //       selectedMembers={selectedTeamMembers}
    //       onSelectionChange={handleSelectionChange}
    //       togglable={true}
    //       filterable={true}
    //     />
    //   }
    //   sidebarWidth="280px"
    // >
    //   <EventEditor
    //     formConfig={[
    //       'smartEventInput',
    //       'teamMember',
    //       'eventType',
    //       'dateRange',
    //       'allDaySwitch',
    //       'timeRange',
    //       'recurrence',
    //       'monthlyRecurrence',
    //     ]}
    //     values={eventEditorValues}
    //     onChange={updateEventData}
    //   />
    //   <DataViewer data={eventEditorOutput} log={false}/>
    // </AppFrame>
    <AppFrame 
      sidebarContent={
        <TeamMemberList 
          teamMembers={TeamMembersData}
          selectedMembers={selectedTeamMembers}
          onSelectionChange={handleSelectionChange}
          onFilterChange={handleTeamMemberFilter}
          showToggleAll={true}
          showFilterField={true}
        />
      }
      sidebarOpen={false}
      sidebarWidth="260px"
    >
      <TeamCalendar
        selectedTeamMembers={selectedTeamMembers}
        onSelectionChange={handleSelectionChange}
        events={[]}
        loading={false}
        error={null}
      />
    </AppFrame>
  );
}