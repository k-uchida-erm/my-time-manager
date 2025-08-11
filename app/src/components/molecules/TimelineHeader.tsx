import React from 'react';
import { TimelineContentTitle } from './TimelineContentTitle';

interface TimelineHeaderProps {
  today: Date;
  className?: string;
  dateSnapshot?: {
    year: string;
    monthLong: string;
    day: string;
    weekdayLong: string;
  };
}

export function TimelineHeader({ 
  today,
  className = "",
  dateSnapshot
}: TimelineHeaderProps) {
  return (
    <div className={`space-y-4 ${className}`}>
      {/* タイトル */}
      <TimelineContentTitle today={today} dateSnapshot={dateSnapshot} />
    </div>
  );
} 