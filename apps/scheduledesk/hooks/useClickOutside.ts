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

      // Check if clicking on a react-select dropdown menu or controls
      const clickedElement = event.target as Element;
      const isReactSelectMenu = clickedElement.closest('.selectmenu__menu') || 
                               clickedElement.closest('.selectmenu__menu-list') ||
                               clickedElement.closest('.selectmenu__option') ||
                               clickedElement.closest('.selectmenu__clear-indicator') ||
                               clickedElement.closest('.selectmenu__dropdown-indicator') ||
                               clickedElement.closest('.selectmenu__control') ||
                               clickedElement.closest('[id^="react-select"]');

      // Do nothing if clicking ref's element or descendent elements or the ignore element or react-select menus
      if (
        isInsideElement ||
        (ignoreRef?.current && ignoreRef.current.contains(event.target as Node)) ||
        isReactSelectMenu
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