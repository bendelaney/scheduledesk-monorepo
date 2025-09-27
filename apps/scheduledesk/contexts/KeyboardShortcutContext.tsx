'use client';

import React, { createContext, useContext, useRef, useEffect, useCallback } from 'react';

interface ShortcutHandler {
  handler: (event: KeyboardEvent) => void;
  priority: number;
  id: string;
  exclusive: boolean;
}

interface KeyboardShortcutContextType {
  registerShortcut: (key: string, handler: (event: KeyboardEvent) => void, priority: number, id: string, exclusive?: boolean) => void;
  unregisterShortcut: (key: string, id: string) => void;
}

const KeyboardShortcutContext = createContext<KeyboardShortcutContextType | null>(null);

export function KeyboardShortcutProvider({ children }: { children: React.ReactNode }) {
  const shortcuts = useRef<Map<string, ShortcutHandler[]>>(new Map());

  const registerShortcut = useCallback((key: string, handler: (event: KeyboardEvent) => void, priority: number, id: string, exclusive: boolean = true) => {
    const existing = shortcuts.current.get(key) || [];
    // Remove any existing handler with the same id to prevent duplicates
    const filtered = existing.filter(s => s.id !== id);
    // Add new handler and sort by priority (higher numbers = higher priority)
    const updated = [...filtered, { handler, priority, id, exclusive }].sort((a, b) => b.priority - a.priority);
    shortcuts.current.set(key, updated);

    console.log(`[KeyboardShortcut] Registered '${key}' for ${id} (priority ${priority}, exclusive: ${exclusive})`);
  }, []);

  const unregisterShortcut = useCallback((key: string, id: string) => {
    const existing = shortcuts.current.get(key) || [];
    const filtered = existing.filter(s => s.id !== id);

    if (filtered.length === 0) {
      shortcuts.current.delete(key);
    } else {
      shortcuts.current.set(key, filtered);
    }

    console.log(`[KeyboardShortcut] Unregistered '${key}' for ${id}`);
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Don't handle shortcuts when user is typing in input fields (unless it's a modifier combination)
      const activeElement = document.activeElement;
      const isTypingInInput = activeElement && (
        activeElement.tagName === 'INPUT' ||
        activeElement.tagName === 'TEXTAREA' ||
        activeElement.getAttribute('contenteditable') === 'true'
      );

      // Create a key signature that includes modifiers
      const modifiers = [];
      if (event.metaKey) modifiers.push('meta');
      if (event.ctrlKey) modifiers.push('ctrl');
      if (event.shiftKey) modifiers.push('shift');
      if (event.altKey) modifiers.push('alt');

      const keySignature = modifiers.length > 0
        ? `${modifiers.join('+')}+${event.key}`
        : event.key;

      const shortcutList = shortcuts.current.get(keySignature) || [];

      if (shortcutList.length > 0) {
        // Skip shortcuts when typing in inputs, unless it's a modifier combination or special keys
        if (isTypingInInput && modifiers.length === 0 && !['Escape', 'Enter', 'Tab'].includes(event.key)) {
          return;
        }

        // Check if any handler is exclusive
        const hasExclusiveHandler = shortcutList.some(s => s.exclusive);

        event.preventDefault();
        event.stopPropagation();

        if (hasExclusiveHandler) {
          // Current behavior: run only highest priority
          const topPriority = shortcutList[0];
          console.log(`[KeyboardShortcut] Executing '${keySignature}' for ${topPriority.id} (priority ${topPriority.priority}, exclusive)`);
          topPriority.handler(event);
        } else {
          // New behavior: run all non-exclusive handlers in priority order
          console.log(`[KeyboardShortcut] Executing '${keySignature}' for ${shortcutList.length} non-exclusive handlers`);
          shortcutList.forEach(shortcut => {
            console.log(`[KeyboardShortcut] - Running ${shortcut.id} (priority ${shortcut.priority})`);
            shortcut.handler(event);
          });
        }
      }
    };

    // Use capture phase to ensure we catch events before they bubble up
    document.addEventListener('keydown', handleKeyDown, { capture: true });

    return () => {
      document.removeEventListener('keydown', handleKeyDown, { capture: true });
    };
  }, []);

  return (
    <KeyboardShortcutContext.Provider value={{ registerShortcut, unregisterShortcut }}>
      {children}
    </KeyboardShortcutContext.Provider>
  );
}

export function useKeyboardShortcuts() {
  const context = useContext(KeyboardShortcutContext);
  if (!context) {
    throw new Error('useKeyboardShortcuts must be used within a KeyboardShortcutProvider');
  }
  return context;
}