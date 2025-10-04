// 1. Create a context file (src/context/ScheduleContext.tsx)
import React, { createContext, useContext, useState } from 'react';

interface ScheduleContextType {
  scheduleStartDate: string;
  scheduleEndDate: string;
  setScheduleStartDate: (date: string) => void;
  setScheduleEndDate: (date: string) => void;
  // Add other state and functions you want to share
}

const ScheduleContext = createContext<ScheduleContextType | undefined>(undefined);

export const useScheduleContext = () => {
  const context = useContext(ScheduleContext);
  if (context === undefined) {
    throw new Error('useScheduleContext must be used within a ScheduleProvider');
  }
  return context;
};

export const ScheduleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Move state from ScheduleDocument.tsx to here
  const [scheduleStartDate, setScheduleStartDate] = useState('');
  const [scheduleEndDate, setScheduleEndDate] = useState('');

  // Create the value object with all the state and functions you want to expose
  const value = {
    scheduleStartDate,
    scheduleEndDate,
    setScheduleStartDate,
    setScheduleEndDate,
    // Add other state and functions
  };

  return (
    <ScheduleContext.Provider value={value}>
      {children}
    </ScheduleContext.Provider>
  );
};
