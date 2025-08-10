import React, { useState, useEffect } from 'react';
import { TimelineRuler, TimelineTimeMarker, TimelineEntry } from '../atoms/timeline';
import { TimeEntry } from '@/lib/types';

interface TimelineGridProps {
  entries: TimeEntry[];
  zoomLevel: number;
  baseHeight: number;
  currentTimePosition?: number;
  selectedEntry: TimeEntry | null;
  onSelectEntry: (entry: TimeEntry, event: React.MouseEvent) => void;
  onEditEntry: (entry: TimeEntry) => void;
  className?: string;
}

export function TimelineGrid({ 
  entries, 
  zoomLevel, 
  baseHeight,
  currentTimePosition,
  selectedEntry,
  onSelectEntry,
  onEditEntry,
  className = ""
}: TimelineGridProps) {
  const [isClient, setIsClient] = useState(false);
  const hours = Array.from({ length: 24 }, (_, i) => i);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const calculatePosition = (entry: TimeEntry) => {
    if (!isClient) {
      return { top: 0, height: 15 * zoomLevel };
    }

    const startTime = new Date(entry.start_time);
    const startHour = startTime.getHours();
    const startMinute = startTime.getMinutes();
    const top = (startHour + startMinute / 60) * (baseHeight / 24) + 20;

    const endTime = new Date(entry.end_time);
    const endHour = endTime.getHours();
    const endMinute = endTime.getMinutes();
    let height = (endHour + endMinute / 60) * (baseHeight / 24) - top + 20;

    // 短い記録でも表示されるように最小高さを設定
    const minHeight = 15 * zoomLevel;
    if (height < minHeight) {
      height = minHeight;
    }

    return { top, height };
  };

  return (
    <div 
      className={`relative ${className}`}
      style={{ 
        height: `${baseHeight * zoomLevel}px`,
        minHeight: '500px',
        paddingTop: '20px'
      }}
    >
      {/* 時間の目盛り */}
      <TimelineRuler 
        hours={hours}
        zoomLevel={zoomLevel}
        baseHeight={baseHeight}
      />

      {/* 現在時刻のライン */}
      {currentTimePosition !== undefined && currentTimePosition > 0 && (
        <TimelineTimeMarker position={currentTimePosition} />
      )}

      {/* タイムエントリ */}
      {entries.map((entry) => {
        const { top, height } = calculatePosition(entry);
        const isSelected = selectedEntry?.id === entry.id;

        return (
          <TimelineEntry
            key={entry.id}
            entry={entry}
            top={top}
            height={height}
            zoomLevel={zoomLevel}
            isSelected={isSelected}
            onSelect={onSelectEntry}
            onEdit={onEditEntry}
          />
        );
      })}
    </div>
  );
} 