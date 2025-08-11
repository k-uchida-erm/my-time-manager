import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { TitleBox } from '../molecules/TitleBox';
import { TimerBox } from '../molecules/TimerBox';
import { TimelineBox } from '../molecules/TimelineBox';
import { TimeEntry } from '@/lib/types';

interface DailyReportTemplateProps {
  timeEntries: TimeEntry[];
  today: Date;
  onUpdateEntry?: (entry: TimeEntry) => void;
  onDeleteEntry?: (entryId: number) => void;
  onNewEntry?: (entry: TimeEntry) => void;
  isUpdating?: number | null;
  isDeleting?: number | null;
  dateSnapshot?: {
    day: string;
    monthLabel: string;
    weekdayLabel: string;
    year: string;
  };
}

export function DailyReportTemplate({ 
  timeEntries, 
  today, 
  onUpdateEntry, 
  onDeleteEntry,
  onNewEntry,
  isUpdating,
  isDeleting,
  dateSnapshot
}: DailyReportTemplateProps) {
  const [localEntries, setLocalEntries] = useState<TimeEntry[]>(timeEntries);
  // SSR提供のtodayをそのまま使用（クライアントでの上書きはしない）

  useEffect(() => {
    setLocalEntries(timeEntries);
  }, [timeEntries]);

  const handleUpdateEntry = useCallback((updatedEntry: TimeEntry) => {
    setLocalEntries(prev => 
      prev.map(entry => 
        entry.id === updatedEntry.id ? updatedEntry : entry
      )
    );
    if (onUpdateEntry) {
      onUpdateEntry(updatedEntry);
    }
  }, [onUpdateEntry]);

  const handleDeleteEntry = useCallback((entryId: number) => {
    setLocalEntries(prev => prev.filter(entry => entry.id !== entryId));
    if (onDeleteEntry) {
      onDeleteEntry(entryId);
    }
  }, [onDeleteEntry]);

  const handleNewEntry = useCallback((newEntry: TimeEntry) => {
    setLocalEntries(prev => [...prev, newEntry]);
    if (onNewEntry) {
      onNewEntry(newEntry);
    }
  }, [onNewEntry]);

  const stats = useMemo(() => {
    const totalDuration = localEntries.reduce((sum, entry) => sum + entry.duration_seconds, 0);
    const totalHours = Math.floor(totalDuration / 3600);
    const totalMinutes = Math.floor((totalDuration % 3600) / 60);
    return { totalDuration, totalHours, totalMinutes, entryCount: localEntries.length };
  }, [localEntries]);

  return (
    <div className="space-y-8">
      <TitleBox 
        today={today} 
        dateSnapshot={dateSnapshot}
        entryCount={stats.entryCount}
        totalHours={stats.totalHours}
        totalMinutes={stats.totalMinutes}
      />

      <div className="grid grid-cols-1 lg:grid-cols-6 gap-8 max-w-5xl mx-auto">
        <div className="lg:col-span-4">
          <TimerBox 
            onNewEntry={handleNewEntry} 
            onTimerCreated={() => {}}
          />
        </div>
        <div className="lg:col-span-2">
          <TimelineBox 
            entries={localEntries}
            today={today}
            onUpdateEntry={handleUpdateEntry}
            onDeleteEntry={handleDeleteEntry}
            isUpdating={isUpdating}
            isDeleting={isDeleting}
          />
        </div>
      </div>
    </div>
  );
} 