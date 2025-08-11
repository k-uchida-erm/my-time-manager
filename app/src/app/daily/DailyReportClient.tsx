'use client'
import { useState, useCallback, useMemo, useEffect } from 'react';
import { DailyReportTemplate } from '@/components/templates/DailyReportTemplate';
import { TimeEntry } from '@/lib/types';
import { updateTimeEntry, deleteTimeEntry } from '@/app/actions';

interface DailyReportClientProps {
  initialTimeEntries: TimeEntry[];
  today: Date;
  // optional to avoid hydration mismatch for date labels
  dateSnapshot?: {
    day: string;
    monthLabel: string;
    weekdayLabel: string;
    year: string;
  };
}

function ymdTokyo(date: Date | string) {
  const d = typeof date === 'string' ? new Date(date) : date;
  const y = new Intl.DateTimeFormat('ja-JP', { year: 'numeric', timeZone: 'Asia/Tokyo' }).format(d);
  const m = new Intl.DateTimeFormat('ja-JP', { month: '2-digit', timeZone: 'Asia/Tokyo' }).format(d);
  const da = new Intl.DateTimeFormat('ja-JP', { day: '2-digit', timeZone: 'Asia/Tokyo' }).format(d);
  return `${y}-${m}-${da}`;
}

export function DailyReportClient({ 
  initialTimeEntries, 
  today,
  dateSnapshot
}: DailyReportClientProps) {
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>(initialTimeEntries);
  const [isUpdating, setIsUpdating] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState<number | null>(null);
  const [currentDayYmd, setCurrentDayYmd] = useState<string>(() => ymdTokyo(today));

  // Midnight rollover: update current day and filter entries to only today (Tokyo)
  useEffect(() => {
    const tick = () => {
      const ymd = ymdTokyo(new Date());
      if (ymd !== currentDayYmd) {
        setCurrentDayYmd(ymd);
        setTimeEntries(prev => prev.filter(e => ymdTokyo(e.start_time) === ymd));
      }
    };
    const id = setInterval(tick, 60_000);
    return () => clearInterval(id);
  }, [currentDayYmd]);

  const handleUpdateEntry = useCallback(async (updatedEntry: TimeEntry) => {
    setIsUpdating(updatedEntry.id);
    try {
      const formData = new FormData();
      formData.append('id', updatedEntry.id.toString());
      formData.append('note', updatedEntry.note || '');
      formData.append('startTime', new Date(updatedEntry.start_time).getTime().toString());
      formData.append('endTime', new Date(updatedEntry.end_time).getTime().toString());
      const result = await updateTimeEntry(formData);
      if (result?.error) {
        console.error('Failed to update entry:', result.error);
        alert(`更新に失敗しました: ${result.error}`);
        return;
      }
      setTimeEntries(prev => prev.map(entry => entry.id === updatedEntry.id ? updatedEntry : entry));
    } catch (error) {
      console.error('Failed to update entry:', error);
      alert('更新に失敗しました。エラーを確認してください。');
    } finally {
      setIsUpdating(null);
    }
  }, []);

  const handleDeleteEntry = useCallback(async (entryId: number) => {
    if (!confirm('この記録を削除しますか？')) return;
    setIsDeleting(entryId);
    try {
      const formData = new FormData();
      formData.append('id', entryId.toString());
      const result = await deleteTimeEntry(formData);
      if (result?.error) {
        console.error('Failed to delete entry:', result.error);
        alert(`削除に失敗しました: ${result.error}`);
        return;
      }
      setTimeEntries(prev => prev.filter(entry => entry.id !== entryId));
    } catch (error) {
      console.error('Failed to delete entry:', error);
      alert('削除に失敗しました。エラーを確認してください。');
    } finally {
      setIsDeleting(null);
    }
  }, []);

  const handleNewEntry = useCallback((newEntry: TimeEntry) => {
    // その日の分だけタイムラインに反映
    if (ymdTokyo(newEntry.start_time) === currentDayYmd) {
      setTimeEntries(prev => [...prev, newEntry]);
    }
  }, [currentDayYmd]);

  const sortedEntries = useMemo(() => {
    return [...timeEntries].sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime());
  }, [timeEntries]);

  return (
    <DailyReportTemplate 
      timeEntries={sortedEntries}
      today={today}
      dateSnapshot={dateSnapshot}
      onUpdateEntry={handleUpdateEntry}
      onDeleteEntry={handleDeleteEntry}
      onNewEntry={handleNewEntry}
      isUpdating={isUpdating}
      isDeleting={isDeleting}
    />
  );
} 