import React, { FC, useState } from 'react';

interface JobTimeInputProps {
  initialTime: string | undefined;
  onTimeChange: (newTime: string) => void;
}

const JobTimeInput: FC<JobTimeInputProps> = ({ initialTime, onTimeChange }) => {
  let initialDate;
  if (initialTime) {
    const [hours, minutes] = initialTime.split(":").map(Number);
    initialDate = new Date();
    initialDate.setHours(hours, minutes);
  }

  const [time, setTime] = useState<Date | undefined>(initialDate);

  const handleTimeChange = (newTime: Date) => {
    setTime(newTime);
    const timeString = newTime.toTimeString().substring(0, 5);
    onTimeChange(timeString);
  };

  return (
    <input
      type="time"
      value={time ? time.toTimeString().substring(0, 5) : ''}
      onChange={event => {
        const [hours, minutes] = event.target.value.split(':').map(Number);
        const newDate = new Date();
        newDate.setHours(hours, minutes);
        handleTimeChange(newDate);
      }}
    />
  );
};

export default JobTimeInput;
