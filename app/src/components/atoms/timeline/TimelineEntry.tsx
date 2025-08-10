import React from 'react';
import { TimeEntry } from '@/lib/types';

interface TimelineEntryProps {
  entry: TimeEntry;
  top: number;
  height: number;
  zoomLevel: number;
  isSelected: boolean;
  onSelect: (entry: TimeEntry, event: React.MouseEvent) => void;
  onEdit: (entry: TimeEntry) => void;
  className?: string;
}

export function TimelineEntry({ 
  entry, 
  top, 
  height, 
  zoomLevel,
  isSelected,
  onSelect,
  onEdit,
  className = ""
}: TimelineEntryProps) {
  const minHeight = 15 * zoomLevel;
  const actualHeight = Math.max(height, minHeight);

  return (
    <div
      className={`absolute left-12 right-2 rounded-md cursor-pointer transition-all duration-200 hover:opacity-80 group bg-blue-500 ${className}`}
      style={{
        top: `${top}px`,
        height: `${actualHeight}px`,
        opacity: 0.8
      }}
      onClick={(e) => onSelect(entry, e)}
    >
      <div className="h-full flex items-center px-2 relative">
        <span className="text-xs font-medium text-white truncate flex-1">
          {entry.timer_title || '作業記録'}
        </span>
        
        {/* 編集済みマーク */}
        {entry.is_edited && (
          <div className="absolute top-1 right-1">
            <div className="w-2 h-2 bg-yellow-400 rounded-full border border-white"></div>
          </div>
        )}
        
        {/* 編集ボタン - ホバー時に表示 */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onEdit(entry);
          }}
          className="absolute right-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-white/20 hover:bg-white/30 rounded p-1"
        >
          <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        </button>
      </div>
    </div>
  );
} 