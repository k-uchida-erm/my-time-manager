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
  // Include 24:00 tick at the bottom
  const hours = Array.from({ length: 25 }, (_, i) => i);

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
    const startSecond = startTime.getSeconds();
    const top = (startHour + startMinute / 60 + startSecond / 3600) * (baseHeight * zoomLevel / 24) + 20;

    const endTime = new Date(entry.end_time);
    const endHour = endTime.getHours();
    const endMinute = endTime.getMinutes();
    const endSecond = endTime.getSeconds();
    let height = (endHour + endMinute / 60 + endSecond / 3600) * (baseHeight * zoomLevel / 24) - top + 20;

    // ズームレベルに応じた最小高さを動的に設定
    let minHeight;
    if (zoomLevel >= 5) {
      // 500%: 2分以下の記録に最小高さ適用
      minHeight = Math.max(8, height < (2 * 60 * baseHeight * zoomLevel / (24 * 3600)) ? 8 : 0);
    } else if (zoomLevel >= 2.5) {
      // 250%: 5分以下の記録に最小高さ適用
      minHeight = Math.max(12, height < (5 * 60 * baseHeight * zoomLevel / (24 * 3600)) ? 12 : 0);
    } else {
      // 100%: 10分以下の記録に最小高さ適用
      minHeight = Math.max(15, height < (10 * 60 * baseHeight * zoomLevel / (24 * 3600)) ? 15 : 0);
    }

    if (height < minHeight) {
      height = minHeight;
    }

    return { top, height };
  };

  return (
    <div 
      className={`relative ${className}`}
      style={{ 
        // Extend a bit more to ensure the 24:00 tick and line are fully visible
        height: `${baseHeight * zoomLevel + 32}px`,
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