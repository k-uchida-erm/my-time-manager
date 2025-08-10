import React from 'react';
import { TimelineGrid } from './TimelineGrid';
import { TimeEntry } from '@/lib/types';

interface TimelineEntryListProps {
  entries: TimeEntry[];
  zoomLevel: number;
  baseHeight: number;
  currentTimePosition?: number;
  selectedEntry: TimeEntry | null;
  onSelectEntry: (entry: TimeEntry, event: React.MouseEvent) => void;
  onEditEntry: (entry: TimeEntry) => void;
  className?: string;
}

export function TimelineEntryList({ 
  entries, 
  zoomLevel, 
  baseHeight,
  currentTimePosition,
  selectedEntry,
  onSelectEntry,
  onEditEntry,
  className = ""
}: TimelineEntryListProps) {
  return (
    <TimelineGrid
      entries={entries}
      zoomLevel={zoomLevel}
      baseHeight={baseHeight}
      currentTimePosition={currentTimePosition}
      selectedEntry={selectedEntry}
      onSelectEntry={onSelectEntry}
      onEditEntry={onEditEntry}
      className={className}
    />
  );
} 