'use client'

import React, { FC, useState, useEffect } from 'react';
import { AvailabilityEvent } from '@/types';
import { X } from "@/components/Icons";
import './SmartEventInput.scss';

interface SmartEventInputProps {
  currentDate?: string;
  additionalRules?: string;
  onParse: (events: AvailabilityEvent[], inputText: string) => void;
  onClear?: () => void;
}

const SmartEventInput: FC<SmartEventInputProps> = ({ 
  currentDate, 
  additionalRules,
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

  const today = currentDate ?? new Date().toISOString().split('T')[0];

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
          inputText,
          today,
          additionalRules
        })
      });

      if (!response.ok) {
        throw new Error('API request failed');
      }

      const result = await response.json();
      setParsedEvents(result.events);
    } catch (error) {
      console.error('Error calling AI API:', error);
      // For now, just show an alert - you might want better error handling
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
        placeholder="✨ Describe your event..."
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