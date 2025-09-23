'use client';

import { useSpinner } from '@/hooks/useSpinner';
import 'spin.js/spin.css';

interface LoadingSpinnerProps {
  isLoading: boolean;
  height?: string;
  className?: string;
}

export default function LoadingSpinner({ 
  isLoading, 
  height = '200px', 
  className = '' 
}: LoadingSpinnerProps) {
  const spinnerRef = useSpinner(isLoading);

  if (!isLoading) return null;

  return (
    <div 
      ref={spinnerRef}
      className={className}
      style={{ 
        position: 'relative', 
        width: '100%',
        height: '100%'
      }}
    />
  );
}