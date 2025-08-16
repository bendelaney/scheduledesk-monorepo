'use client'

import { useEffect } from 'react';

type Handler = (event: MouseEvent | TouchEvent) => void;

const useClickOutside = (
  ref: React.RefObject<HTMLElement|null>,
  handler: Handler,
  ignoreRef?: React.RefObject<HTMLElement>,
  isEnabled: boolean = true,
) => {
  useEffect(() => {
    if (!isEnabled) {
      return;
    }

    const listener = (event: MouseEvent | TouchEvent) => {
      let targetElement: Node | null = event.target as Node; // clicked element
      let isInsideElement = false;

      // Check if the target element is inside the ref element or a descendant of it
      while (targetElement) {
        if (targetElement === ref.current) {
          isInsideElement = true;
          break;
        }
        targetElement = targetElement.parentNode;
      }

      // Do nothing if clicking ref's element or descendent elements or the ignore element
      if (
        isInsideElement ||
        (ignoreRef?.current && ignoreRef.current.contains(event.target as Node))
      ) {
        return;
      }

      handler(event);
    };

    document.addEventListener('mousedown', listener);
    document.addEventListener('touchstart', listener);

    return () => {
      document.removeEventListener('mousedown', listener);
      document.removeEventListener('touchstart', listener);
    };
  }, [ref, handler, ignoreRef, isEnabled]); // Re-run if ref, handler, ignoreRef or isEnabled changes
};

export { useClickOutside };