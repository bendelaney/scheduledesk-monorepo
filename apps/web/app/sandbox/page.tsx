'use client';

import React, { useState } from 'react';
import EventEditor from '@/components/EventEditor';
import DataViewer from '@/components/DataViewer';
import DateRangeSelector from '@/components/DateRangeSelector';
import CalendarGrid from '@/components/CalendarGrid';
import { AvailabilityEvent } from '@/types';
import './page.scss';

export default function Sandbox() {
  const [eventData, setEventData] = useState<Partial<AvailabilityEvent> | undefined>(undefined);

  const handleEventChange = (data: any) => {
    console.log('Event data changed:', data);
    setEventData(data);
  };

  return (
    <div className="sandbox-container">
      <CalendarGrid/>


      {/* <div className="left">
        <EventEditor 
          values={eventData}
          onChange={handleEventChange}
        />
      </div> */}
      {/* <div className="right">
        <DataViewer data={eventData || {}} log={false}/>
      </div> */}
    </div>
  );
}