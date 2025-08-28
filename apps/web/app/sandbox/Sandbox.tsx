'use client';

import React, { useState, useCallback } from 'react';
import AppFrame from '@/components/AppFrame';
import TeamCalendar from '@/components/TeamCalendar';
import TeamMemberToggleList from '@/components/TeamMemberToggleList';
import TeamMembersData from '@/data/teamMembersData';
import { AvailabilityEvent, RecurrenceType, EventTypeType } from '@/types';
import EventEditor from '@/components/EventEditor';
import './page.scss';
import DataViewer from '@/components/DataViewer';
import { DateTime } from 'luxon';

export default function Sandbox() {
  const [selectedTeamMembers, setSelectedTeamMembers] = useState<string[]>(
    TeamMembersData.map(m => m.displayName || `${m.firstName} ${m.lastName || ''}`.trim())
  );

  const handleSelectionChange = (selected: string[]) => {
    console.log('Team member selection changed:', selected);
    setSelectedTeamMembers(selected);
  };

  const currentDate = DateTime.now().toISODate();
  const teamMemberList = TeamMembersData.map((member) => (member.firstName + " " + member.lastName));

  const defaultEvent: AvailabilityEvent[] = [{
    teamMember: {
      firstName: "Ben",
      lastName: "Delaney",
    },
    eventType: "Personal Appointment" as EventTypeType, // Add type assertion here
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
    //     <TeamMemberToggleList 
    //       teamMembers={TeamMembersData}
    //       selectedMembers={selectedTeamMembers}
    //       onSelectionChange={handleSelectionChange}
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
      sidebar={
        <TeamMemberToggleList 
          teamMembers={TeamMembersData}
          selectedMembers={selectedTeamMembers}
          onSelectionChange={handleSelectionChange}
        />
      }
      sidebarOpen={false}
      sidebarWidth="260px"
    >
      <TeamCalendar 
        selectedTeamMembers={selectedTeamMembers}
        onSelectionChange={handleSelectionChange}
      />
    </AppFrame>
  );
}