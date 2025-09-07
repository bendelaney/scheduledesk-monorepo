import { useEffect, useRef } from 'react';
import { Spinner } from 'spin.js';

const defaultOptions = {
    lines: 2
  ,length: 0
  ,width: 28
  ,radius: 8
  ,trail: 50
  ,color: '#5e5c5c'
  ,speed: 1.5
  ,shadow: false
} as const;

export function useSpinner(isActive: boolean, options = defaultOptions) {
  const containerRef = useRef<HTMLDivElement>(null);
  const spinnerInstance = useRef<Spinner | null>(null);

  useEffect(() => {
    if (isActive && containerRef.current) {
      spinnerInstance.current = new Spinner(options).spin(containerRef.current);
    } else if (spinnerInstance.current) {
      spinnerInstance.current.stop();
    }

    return () => {
      if (spinnerInstance.current) {
        spinnerInstance.current.stop();
      }
    };
  }, [isActive]);

  return containerRef;
}