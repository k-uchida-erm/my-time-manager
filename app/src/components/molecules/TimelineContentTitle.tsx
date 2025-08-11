import React from 'react';
import { ContentTitle } from '../atoms/ui';

interface TimelineContentTitleProps {
  today: Date;
  className?: string;
  dateSnapshot?: {
    year: string;
    monthLong: string;
    day: string;
    weekdayLong: string;
  };
}

export function TimelineContentTitle({ today, className = "", dateSnapshot }: TimelineContentTitleProps) {
  const icon = (
    <svg fill="currentColor" viewBox="0 0 24 24">
      <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
    </svg>
  );

  const subtitle = dateSnapshot
    ? `${dateSnapshot.year}年${dateSnapshot.monthLong}${dateSnapshot.day}日${dateSnapshot.weekdayLong}`
    : today.toLocaleDateString('ja-JP', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        weekday: 'long'
      });

  return (
    <ContentTitle
      icon={icon}
      title="今日のタイムライン"
      subtitle={subtitle}
      className={className}
    />
  );
} 