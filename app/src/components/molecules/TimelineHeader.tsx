import React from 'react';
import { TimelineContentTitle } from './TimelineContentTitle';

interface TimelineHeaderProps {
  today: Date;
  className?: string;
}

export function TimelineHeader({ 
  today,
  className = ""
}: TimelineHeaderProps) {
  return (
    <div className={`space-y-4 ${className}`}>
      {/* タイトル */}
      <TimelineContentTitle today={today} />
    </div>
  );
} 