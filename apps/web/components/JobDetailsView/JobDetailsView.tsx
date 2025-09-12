import React from 'react';
import { JobDetailsView as SharedJobDetailsView, type JobVisit } from '@repo/components';
import DateSelector from '@/components/DateSelector';
import { LinkOut } from '@/components/Icons';

interface JobDetailsViewProps {
  id?: string;
  job: JobVisit;
  className?: string;
  onAnimationEnd?: React.AnimationEventHandler<HTMLDivElement>;
  onDateChange?: (date: Date | null) => void;
  onTimeChange?: (startTime: string | undefined, endTime: string | undefined) => void;
  onStatusChange?: (status: string) => void;
}

const JobDetailsView: React.FC<JobDetailsViewProps> = (props) => {
  return (
    <SharedJobDetailsView
      {...props}
      DateSelector={DateSelector}
      LinkOutIcon={LinkOut}
    />
  );
};

export { JobDetailsView };