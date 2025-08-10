import React from 'react';
import { Timeline } from '../organisms/Timeline';
import { TimeEntry } from '@/lib/types';

interface TimelineBoxProps {
  entries: TimeEntry[];
  today: Date;
  onUpdateEntry?: (entry: TimeEntry) => void;
  onDeleteEntry?: (entryId: number) => void;
  isUpdating?: number | null;
  isDeleting?: number | null;
}

export function TimelineBox({ 
  entries, 
  today, 
  onUpdateEntry, 
  onDeleteEntry,
  isUpdating,
  isDeleting
}: TimelineBoxProps) {
  return (
    <Timeline
      entries={entries}
      today={today}
      onUpdateEntry={onUpdateEntry}
      onDeleteEntry={onDeleteEntry}
      isUpdating={isUpdating}
      isDeleting={isDeleting}
    />
  );
} 