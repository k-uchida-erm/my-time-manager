'use client'
import React, { useRef } from 'react';
import { TimelineContainer, TimelineTooltip, TimelineControls } from '../atoms/timeline';
import { TimelineHeader } from '../molecules/TimelineHeader';
import { TimelineEntryList } from '../molecules/TimelineEntryList';
import { TimeEntryEditModal } from '../molecules/TimeEntryEditModal';
import { TimeEntry } from '@/lib/types';
import { useTimelineState } from '@/hooks/timeline/useTimelineState';

interface TimelineProps {
  entries: TimeEntry[];
  today: Date;
  onUpdateEntry?: (entry: TimeEntry) => void;
  onDeleteEntry?: (entryId: number) => void;
  isUpdating?: number | null;
  isDeleting?: number | null;
  className?: string;
  dateSnapshot?: {
    year: string;
    monthLong: string;
    day: string;
    weekdayLong: string;
  };
}

export function Timeline({ 
  entries, 
  today, 
  onUpdateEntry, 
  onDeleteEntry,
  isUpdating,
  isDeleting,
  className = "",
  dateSnapshot
}: TimelineProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const {
    currentTime,
    isClient,
    selectedEntry,
    tooltipPosition,
    isEditModalOpen,
    editingEntry,
    zoomLevel,
    setScrollTop,
    setIsEditModalOpen,
    setEditingEntry,
    handleZoomChange,
    handleSelectEntry,
    handleEditEntry,
    handleSaveEntry,
    handleDeleteEntry,
  } = useTimelineState({ onUpdateEntry, onDeleteEntry });

  const baseHeight = 500;
  const getCurrentTimePosition = () => {
    if (!currentTime || !isClient) return 0;
    const hour = currentTime.getHours();
    const minute = currentTime.getMinutes();
    return (hour + minute / 60) * (baseHeight * zoomLevel) / 24 + 20;
  };

  // Container height fixed to 100% view height so the frame size is constant across zooms
  const containerHeight = `${baseHeight + 32}px`;

  return (
    <div className={`space-y-6 ${className}`}>
      {/* ヘッダー */}
      <TimelineHeader
        today={today}
        dateSnapshot={dateSnapshot}
      />
      
      {/* タイムライン */}
      <div className="bg-white/80 backdrop-blur-sm border border-gray-200 rounded-2xl p-6 shadow-lg relative">
        <TimelineContainer
          ref={containerRef}
          onScroll={setScrollTop}
          height={containerHeight}
          maxHeight={containerHeight}
        >
          <TimelineEntryList
            entries={entries}
            zoomLevel={zoomLevel}
            baseHeight={baseHeight}
            currentTimePosition={isClient ? getCurrentTimePosition() : undefined}
            selectedEntry={selectedEntry}
            onSelectEntry={(entry, e) => handleSelectEntry(entry, e, containerRef.current)}
            onEditEntry={handleEditEntry}
          />
        </TimelineContainer>
        
        {/* ズームコントロール */}
        <TimelineControls
          zoomLevel={zoomLevel}
          onZoomChange={(zl) => handleZoomChange(zl, containerRef.current)}
        />

        {/* メモの吹き出し - タイムラインコンテナ内に配置 */}
        {selectedEntry && tooltipPosition && (
          <TimelineTooltip
            entry={selectedEntry}
            onEdit={handleEditEntry}
            onClose={() => {
              // 閉じる挙動は従来どおり
              (document.getElementById('timeline-tooltip'));
            }}
            position={tooltipPosition}
            id="timeline-tooltip"
          />
        )}

        {/* 編集モーダル - タイムラインコンテナ内に配置 */}
        <TimeEntryEditModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setEditingEntry(null);
          }}
          onSave={handleSaveEntry}
          onDelete={handleDeleteEntry}
          entry={editingEntry}
        />
      </div>
    </div>
  );
} 