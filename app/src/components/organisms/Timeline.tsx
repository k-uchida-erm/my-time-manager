'use client'
import React, { useState, useEffect, useRef } from 'react';
import { TimelineContainer, TimelineTooltip, TimelineControls } from '../atoms/timeline';
import { TimelineHeader } from '../molecules/TimelineHeader';
import { TimelineEntryList } from '../molecules/TimelineEntryList';
import { TimeEntryEditModal } from '../molecules/TimeEntryEditModal';
import { TimeEntry } from '@/lib/types';

interface TimelineProps {
  entries: TimeEntry[];
  today: Date;
  onUpdateEntry?: (entry: TimeEntry) => void;
  onDeleteEntry?: (entryId: number) => void;
  isUpdating?: number | null;
  isDeleting?: number | null;
  className?: string;
}

export function Timeline({ 
  entries, 
  today, 
  onUpdateEntry, 
  onDeleteEntry,
  isUpdating,
  isDeleting,
  className = ""
}: TimelineProps) {
  const [currentTime, setCurrentTime] = useState<Date | null>(null);
  const [selectedEntry, setSelectedEntry] = useState<TimeEntry | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState<{ top: number; left: number } | null>(null);
  const [isClient, setIsClient] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<TimeEntry | null>(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [scrollTop, setScrollTop] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsClient(true);
    setCurrentTime(new Date());
    
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // 1分ごとに更新

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!selectedEntry || !tooltipPosition) return;
    const handleClick = (e: MouseEvent) => {
      // Tooltip自体のクリックは閉じない
      const tooltip = document.getElementById('timeline-tooltip');
      if (tooltip && tooltip.contains(e.target as Node)) return;
      setSelectedEntry(null);
      setTooltipPosition(null);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [selectedEntry, tooltipPosition]);

  const baseHeight = 500;

  const getCurrentTimePosition = () => {
    if (!currentTime || !isClient) return 0;
    const now = currentTime;
    const hour = now.getHours();
    const minute = now.getMinutes();
    return (hour + minute / 60) * (baseHeight * zoomLevel) / 24 + 20;
  };

  const handleSelectEntry = (entry: TimeEntry, event: React.MouseEvent) => {
    if (selectedEntry?.id === entry.id) {
      setSelectedEntry(null);
      setTooltipPosition(null);
    } else {
      setSelectedEntry(entry);
      
      // クリック位置を取得してツールチップの位置を計算
      const rect = event.currentTarget.getBoundingClientRect();
      const containerRect = containerRef.current?.getBoundingClientRect();
      
      if (containerRect) {
        // エントリの右端から左に配置（さらに左の位置）
        const left = rect.right - containerRect.left - 40;
        // エントリの中央位置に配置
        const top = rect.top - containerRect.top + (rect.height / 2);
        
        console.log('Tooltip position:', { top, left, rect, containerRect });
        setTooltipPosition({ top, left });
      }
    }
  };

  const handleEditEntry = (entry: TimeEntry) => {
    setEditingEntry(entry);
    setIsEditModalOpen(true);
  };

  const handleSaveEntry = (updatedEntry: TimeEntry) => {
    if (onUpdateEntry) {
      onUpdateEntry(updatedEntry);
    }
  };

  const handleDeleteEntry = (entryId: number) => {
    if (onDeleteEntry) {
      onDeleteEntry(entryId);
    }
  };



  return (
    <div className={`space-y-6 ${className}`}>
      {/* ヘッダー */}
      <TimelineHeader
        today={today}
      />
      
      {/* タイムライン */}
      <div className="bg-white/80 backdrop-blur-sm border border-gray-200 rounded-2xl p-6 shadow-lg relative">
        <TimelineContainer
          ref={containerRef}
          onScroll={setScrollTop}
        >
          <TimelineEntryList
            entries={entries}
            zoomLevel={zoomLevel}
            baseHeight={baseHeight}
            currentTimePosition={isClient ? getCurrentTimePosition() : undefined}
            selectedEntry={selectedEntry}
            onSelectEntry={handleSelectEntry}
            onEditEntry={handleEditEntry}
          />
        </TimelineContainer>
        
        {/* ズームコントロール */}
        <TimelineControls
          zoomLevel={zoomLevel}
          onZoomChange={setZoomLevel}
        />

        {/* メモの吹き出し - タイムラインコンテナ内に配置 */}
        {selectedEntry && tooltipPosition && (
          <TimelineTooltip
            entry={selectedEntry}
            onEdit={handleEditEntry}
            onClose={() => {
              setSelectedEntry(null);
              setTooltipPosition(null);
            }}
            position={tooltipPosition}
            id="timeline-tooltip"
          />
        )}
      </div>

      {/* 編集モーダル */}
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
  );
} 