'use client';

import { useState, useEffect } from 'react';

export function useSidebarState(storageKey: string, defaultOpen: boolean = true) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(defaultOpen);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(storageKey);
    if (saved !== null) {
      setIsSidebarOpen(JSON.parse(saved));
    }
    setIsLoaded(true);
  }, [storageKey]);

  // Save to localStorage when state changes (after initial load)
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(storageKey, JSON.stringify(isSidebarOpen));
    }
  }, [isSidebarOpen, storageKey, isLoaded]);

  return [isSidebarOpen, setIsSidebarOpen] as const;
}
