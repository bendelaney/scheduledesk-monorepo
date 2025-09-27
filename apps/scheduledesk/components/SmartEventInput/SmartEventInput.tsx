'use client'

import React, { FC, useState, useEffect, useRef, useCallback } from 'react';
import { AvailabilityEvent } from '@/types';
import { getTodayInLocalTimezone } from '@/utils/dateUtils';
import { X } from "@/components/Icons";
import './SmartEventInput.scss';

const LOADING_MESSAGES = [
  'Loading...',
  'Prepping...',
  'Processing...',
  'Working...',
  'Thinking...',
  'Tinkering...',
  'Brewing...',
  'Fetching...',
  'Assembling...',
  'Jimmying...',
  'Crunching...',
  'Computing...',
  'Parsing...',
  'Generating...',
];

const getRandomLoadingMessage = () => {
  return LOADING_MESSAGES[Math.floor(Math.random() * LOADING_MESSAGES.length)];
};

interface SmartEventInputProps {
  currentDate?: string;
  additionalRules?: string;
  placeholderText?: string;
  teamMembers?: { firstName: string; lastName: string; id: string }[];
  onParse: (events: AvailabilityEvent[], inputText: string) => void;
  onClear?: () => void;
}

const SmartEventInput: FC<SmartEventInputProps> = ({
  currentDate,
  additionalRules,
  placeholderText = "✨ Describe your event...",
  teamMembers = [],
  onParse,
  onClear
}) => {
  const [inputText, setInputText] = useState('');
  const [inputIsFocused, setInputIsFocused] = useState(false);
  const [parsedEvents, setParsedEvents] = useState<AvailabilityEvent[] | null>(null);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (onParse && parsedEvents) {
      onParse(parsedEvents, inputText);
    }
  }, [parsedEvents]);

  const today = currentDate ?? getTodayInLocalTimezone();

  const handleSubmit = async () => {
    setLoading(true);
    const prevText = inputText;
    setInputText(getRandomLoadingMessage());
    
    try {
      const response = await fetch('/api/openai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inputText: prevText,
          today,
          additionalRules: additionalRules || '',
          teamMembers
        }),
      });
  
      // Log response details for debugging
      console.log('Response status:', response.status);
      console.log('Response status text:', response.statusText);
  
      if (!response.ok) {
        let errorMessage;
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorData.message || `HTTP ${response.status}: ${response.statusText}`;
          console.log('Error response data:', errorData);
        } catch (jsonError) {
          // If JSON parsing fails, get the raw text
          try {
            const errorText = await response.text();
            console.log('Raw error response:', errorText);
            errorMessage = `HTTP ${response.status}: ${errorText || response.statusText}`;
          } catch (textError) {
            errorMessage = `HTTP ${response.status}: ${response.statusText}`;
          }
        }
        throw new Error(errorMessage);
      }
  
      const data = await response.json();
      console.log('Success response:', data);
      
      if (data.events) {
        setParsedEvents(data.events);
      } else {
        console.error('No events in API response:', data);
        alert('Error: API did not return events. Please try again.');
      }
    } catch (error) {
      console.error('Full error details:', error);
      
      // More specific error messages
      if (error instanceof Error) {
        if (error.message.includes('Failed to fetch')) {
          alert('Network error. Please check your connection and try again.');
        } else if (error.message.includes('500')) {
          alert('Server error. Please check the server logs.');
        } else {
          alert(`Error: ${error.message}`);
        }
      } else {
        alert('An unexpected error occurred. Please try again.');
      }
    } finally {
      setInputText(prevText);
      setLoading(false);
    }
  };
  
  const handleInputFocus = useCallback(() => {
    inputRef.current?.focus();
    setInputIsFocused(true);
  }, []);

  const handleInputClear = () => {
    setInputText('');
    setParsedEvents(null);

    if (onClear) {
      onClear();
    }    

    // Give input focus after clearing
    setTimeout(() => {
      handleInputFocus();
    }, 0);
  };

  return (
    <div className="smart-event-input">
      <input 
        className={`smart-event-input-input ${loading ? 'loading' : ''}`}
        placeholder={placeholderText}
        value={inputText}
        disabled={loading}
        onChange={(e) => setInputText(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !loading && inputText.trim()) {
            e.preventDefault();
            handleSubmit();
          }
        }}
      />
      {inputText && (
      <button
        className="smart-event-input-input__filter-clear"
        onClick={handleInputClear}
        aria-label="Clear input"
      >
        ✕
      </button>
      )}
      {/* {(inputIsFocused && inputText) && (
        <span 
          className="smart-event-input__filter-key-tip"
          title={'Hit the \'/\' key to start searching'}
        >
          ENTER
        </span>
      )} */}
      {/* <button 
        className={`smart-event-input-clear-button ${!inputText.length ? 'hide' : ''}`}
        onClick={handleInputClear}
      >
        <X />
      </button> */}
    </div>
  );
};

export default SmartEventInput;