'use client';

import { useEffect, useId } from 'react';
import { useKeyboardShortcuts } from '@/contexts/KeyboardShortcutContext';

/**
 * Hook for registering keyboard shortcuts with automatic cleanup
 *
 * @param key - The key to listen for (e.g., 'n', 'Escape', 'Enter')
 * @param handler - Function to call when key is pressed
 * @param priority - Priority level (higher = more important)
 * @param deps - Dependency array for handler changes
 * @param options - Additional options
 */
export function useKeyboardShortcut(
  key: string,
  handler: (event: KeyboardEvent) => void,
  priority: number,
  deps: React.DependencyList = [],
  options?: {
    /** Whether this shortcut requires meta/cmd key */
    meta?: boolean;
    /** Whether this shortcut requires ctrl key */
    ctrl?: boolean;
    /** Whether this shortcut requires shift key */
    shift?: boolean;
    /** Whether this shortcut requires alt key */
    alt?: boolean;
    /** Custom identifier for debugging (auto-generated if not provided) */
    id?: string;
    /** Whether this shortcut is exclusive (default true) */
    exclusive?: boolean;
  }
) {
  const { registerShortcut, unregisterShortcut } = useKeyboardShortcuts();
  const autoId = useId();
  const id = options?.id || `shortcut-${autoId}`;

  useEffect(() => {
    // Build the key signature with modifiers
    const modifiers = [];
    if (options?.meta) modifiers.push('meta');
    if (options?.ctrl) modifiers.push('ctrl');
    if (options?.shift) modifiers.push('shift');
    if (options?.alt) modifiers.push('alt');

    const keySignature = modifiers.length > 0
      ? `${modifiers.join('+')}+${key}`
      : key;

    // Wrapper to check modifiers match exactly
    const wrappedHandler = (event: KeyboardEvent) => {
      const metaMatch = !options?.meta || event.metaKey;
      const ctrlMatch = !options?.ctrl || event.ctrlKey;
      const shiftMatch = !options?.shift || event.shiftKey;
      const altMatch = !options?.alt || event.altKey;

      // Also ensure we don't have extra modifiers when none are required
      if (!options?.meta && !options?.ctrl && !options?.shift && !options?.alt) {
        if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
          return; // Extra modifiers present, don't handle
        }
      }

      if (metaMatch && ctrlMatch && shiftMatch && altMatch) {
        handler(event);
      }
    };

    registerShortcut(keySignature, wrappedHandler, priority, id, options?.exclusive ?? true);

    return () => {
      unregisterShortcut(keySignature, id);
    };
  }, [key, priority, id, ...deps]);
}

/**
 * Convenience hooks for common modifier combinations
 */
export const useMetaKeyShortcut = (
  key: string,
  handler: (event: KeyboardEvent) => void,
  priority: number,
  deps: React.DependencyList = [],
  id?: string
) => useKeyboardShortcut(key, handler, priority, deps, { meta: true, id });

export const useCtrlKeyShortcut = (
  key: string,
  handler: (event: KeyboardEvent) => void,
  priority: number,
  deps: React.DependencyList = [],
  id?: string
) => useKeyboardShortcut(key, handler, priority, deps, { ctrl: true, id });

export const useEscapeKey = (
  handler: (event: KeyboardEvent) => void,
  priority: number,
  deps: React.DependencyList = [],
  id?: string
) => useKeyboardShortcut('Escape', handler, priority, deps, { id });

export const useEnterKey = (
  handler: (event: KeyboardEvent) => void,
  priority: number,
  deps: React.DependencyList = [],
  options?: { meta?: boolean; ctrl?: boolean; id?: string }
) => useKeyboardShortcut('Enter', handler, priority, deps, options);