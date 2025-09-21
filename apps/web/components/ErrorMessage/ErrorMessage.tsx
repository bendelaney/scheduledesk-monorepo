import React from 'react';
import './ErrorMessage.scss';

interface ErrorMessageProps {
  error: string | null;
  className?: string;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({ error, className = '' }) => {
  if (!error) return null;

  return (
    <div className={`error-message ${className}`}>
      {error}
    </div>
  );
};

export default ErrorMessage;