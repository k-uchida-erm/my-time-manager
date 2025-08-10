import React from 'react';
import { TimeEntry } from '@/lib/types';

interface TimelineTooltipProps {
  entry: TimeEntry;
  onEdit: (entry: TimeEntry) => void;
  onClose: () => void;
  position?: { top: number; left: number };
  className?: string;
  id?: string;
}

export function TimelineTooltip({ 
  entry, 
  onEdit, 
  onClose,
  position,
  className = "",
  id
}: TimelineTooltipProps) {
  const formatTime = (timeString: string) => {
    const date = new Date(timeString);
    return date.toLocaleTimeString('ja-JP', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
  };

  const tooltipStyle = position ? {
    position: 'absolute' as const,
    top: `${position.top}px`,
    left: `${position.left}px`,
    zIndex: 50,
    transform: 'translateY(-50%)' // 垂直方向の中央揃え
  } : {};

  console.log('TimelineTooltip style:', tooltipStyle);

  return (
    <div 
      id={id}
      className={`p-3 bg-card border rounded-lg shadow-lg min-w-48 ${className}`}
      style={tooltipStyle}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <div 
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: entry.timer_color || '#3B82F6' }}
            />
            <span className="text-sm font-medium text-foreground">
              {entry.timer_title || '作業記録'}
            </span>
            {/* 編集済みマーク */}
            {entry.is_edited && (
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                <span className="text-xs text-muted-foreground">編集済み</span>
              </div>
            )}
          </div>
          {entry.note && (
            <p className="text-sm text-muted-foreground mb-2">
              {entry.note}
            </p>
          )}
          <div className="text-xs text-muted-foreground">
            {formatTime(entry.start_time)} - {formatTime(entry.end_time)}
            <span className="ml-2">
              ({Math.round(entry.duration_seconds / 60)}分)
            </span>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit(entry);
            }}
            className="text-muted-foreground hover:text-foreground p-1"
            title="編集"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
} 