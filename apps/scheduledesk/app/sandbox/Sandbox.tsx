'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import AppFrame from '@/components/AppFrame';
import { DragLockProvider } from '@/components/DragDrop/DragDrop';
import { PopoverProvider } from '@/components/Popover';
import './page.scss';

// TEMPORARY DATA
import scheduleDocumentData from '@/data/scheduleDocumentData';

const ScheduleDocument = dynamic(() => import('@/components/ScheduleDocument'), {
  ssr: false,
});

export default function Sandbox() {
  return (
    <AppFrame>
      <DragLockProvider>
        <PopoverProvider scrollContainerRef={{ current: null }}>
          <ScheduleDocument scheduleDocument={scheduleDocumentData} />
        </PopoverProvider>
      </DragLockProvider>
    </AppFrame>
  );
}