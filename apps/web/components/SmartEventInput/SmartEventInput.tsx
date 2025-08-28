'use client'

import React, { FC, useState, useEffect } from 'react';
import { AvailabilityEvent } from '@/types';
import { getTodayInLocalTimezone } from '@/utils/dateUtils';
import { X } from "@/components/Icons";
import './SmartEventInput.scss';

interface SmartEventInputProps {
  currentDate?: string;
  additionalRules?: string;
  placeholderText?: string;
  onParse: (events: AvailabilityEvent[], inputText: string) => void;
  onClear?: () => void;
}

const SmartEventInput: FC<SmartEventInputProps> = ({ 
  currentDate, 
  additionalRules,
  placeholderText = "✨ Describe your event...",
  onParse,
  onClear
}) => {
  const [inputText, setInputText] = useState('');
  const [parsedEvents, setParsedEvents] = useState<AvailabilityEvent[] | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (onParse && parsedEvents) {
      onParse(parsedEvents, inputText);
    }
  }, [parsedEvents]);

  const today = currentDate ?? getTodayInLocalTimezone();

  const handleSubmit = async () => {
    setLoading(true);
    const prevText = inputText;
    setInputText('Loading...');
    
    try {
      const response = await fetch('/api/openai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inputText: prevText,
          today,
          additionalRules: additionalRules || ''
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `API request failed: ${response.status}`);
      }

      const data = await response.json();
      if (data.events) {
        setParsedEvents(data.events);
      } else {
        console.error('No events in API response');
        alert('Error processing AI response. Please try again.');
      }
    } catch (error) {
      console.error('Error calling API:', error);
      alert('Error processing your request. Please try again.');
    } finally {
      setInputText(prevText);
      setLoading(false);
    }
  };

  const handleClear = () => {
    setInputText('');
    setParsedEvents(null);

    if (onClear) {
      onClear();
    }    

    // Give input focus after clearing
    setTimeout(() => {
      const inputElement = document.querySelector('.smart-event-input-input') as HTMLInputElement;
      if (inputElement) {
        inputElement.focus();
      }
    }, 0);
  };

  return (
    <div className="smart-event-input-wrapper">
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
      <button 
        className={`smart-event-input-clear-button ${!inputText.length ? 'hide' : ''}`}
        onClick={handleClear}
      >
        <X />
      </button>
    </div>
  );
};

export default SmartEventInput;