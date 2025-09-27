'use client'

import React, { createContext, useContext, useState, useRef, useCallback, ReactNode } from 'react';

interface CalendarUIContextType {
  saveStates: {
    saving: string | null;
    saved: string | null;
  };
  setSaving: (eventId: string | null) => void;
  setSaved: (eventId: string) => void;
  clearSaved: () => void;
}

const CalendarUIContext = createContext<CalendarUIContextType | undefined>(undefined);

interface CalendarUIProviderProps {
  children: ReactNode;
}

export const CalendarUIProvider: React.FC<CalendarUIProviderProps> = ({ children }) => {
  const [saveStates, setSaveStates] = useState({
    saving: null as string | null,
    saved: null as string | null,
  });

  const savedTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const setSaving = useCallback((eventId: string | null) => {
    setSaveStates(prev => ({
      ...prev,
      saving: eventId,
      saved: null // Clear saved state when starting to save
    }));
  }, []);

  const setSaved = useCallback((eventId: string) => {
    setSaveStates(prev => ({
      ...prev,
      saving: null,
      saved: eventId
    }));

    // Clear any existing timeout
    if (savedTimeoutRef.current) {
      clearTimeout(savedTimeoutRef.current);
    }

    // Auto-clear saved state after 2 seconds
    savedTimeoutRef.current = setTimeout(() => {
      setSaveStates(prev => ({
        ...prev,
        saved: null
      }));
    }, 2000);
  }, []);

  const clearSaved = useCallback(() => {
    // Clear timeout if it exists
    if (savedTimeoutRef.current) {
      clearTimeout(savedTimeoutRef.current);
      savedTimeoutRef.current = null;
    }

    setSaveStates(prev => ({
      ...prev,
      saved: null
    }));
  }, []);

  // Cleanup timeout on unmount
  React.useEffect(() => {
    return () => {
      if (savedTimeoutRef.current) {
        clearTimeout(savedTimeoutRef.current);
      }
    };
  }, []);

  const value: CalendarUIContextType = {
    saveStates,
    setSaving,
    setSaved,
    clearSaved,
  };

  return (
    <CalendarUIContext.Provider value={value}>
      {children}
    </CalendarUIContext.Provider>
  );
};

export const useCalendarUI = (): CalendarUIContextType => {
  const context = useContext(CalendarUIContext);
  if (context === undefined) {
    throw new Error('useCalendarUI must be used within a CalendarUIProvider');
  }
  return context;
};