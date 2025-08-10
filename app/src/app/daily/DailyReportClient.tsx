'use client'
import { useState, useCallback, useMemo } from 'react';
import { DailyReportTemplate } from '@/components/templates/DailyReportTemplate';
import { TimeEntry } from '@/lib/types';
import { updateTimeEntry, deleteTimeEntry } from '@/app/actions';

interface DailyReportClientProps {
  initialTimeEntries: TimeEntry[];
  today: Date;
}

export function DailyReportClient({ 
  initialTimeEntries, 
  today
}: DailyReportClientProps) {
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>(initialTimeEntries);
  const [isUpdating, setIsUpdating] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState<number | null>(null);

  // エラーハンドリング付きの更新処理
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
      
      // ローカル状態を更新
      setTimeEntries(prev => 
        prev.map(entry => 
          entry.id === updatedEntry.id ? updatedEntry : entry
        )
      );
    } catch (error) {
      console.error('Failed to update entry:', error);
      alert('更新に失敗しました。エラーを確認してください。');
    } finally {
      setIsUpdating(null);
    }
  }, []);

  // エラーハンドリング付きの削除処理
  const handleDeleteEntry = useCallback(async (entryId: number) => {
    if (!confirm('この記録を削除しますか？')) {
      return;
    }

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
      
      // ローカル状態を更新
      setTimeEntries(prev => prev.filter(entry => entry.id !== entryId));
    } catch (error) {
      console.error('Failed to delete entry:', error);
      alert('削除に失敗しました。エラーを確認してください。');
    } finally {
      setIsDeleting(null);
    }
  }, []);

  // 新しい記録の追加処理
  const handleNewEntry = useCallback((newEntry: TimeEntry) => {
    setTimeEntries(prev => [...prev, newEntry]);
  }, []);

  // ソート済みのエントリをメモ化
  const sortedEntries = useMemo(() => {
    return [...timeEntries].sort((a, b) => 
      new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
    );
  }, [timeEntries]);

  return (
    <DailyReportTemplate 
      timeEntries={sortedEntries}
      today={today}
      onUpdateEntry={handleUpdateEntry}
      onDeleteEntry={handleDeleteEntry}
      onNewEntry={handleNewEntry}
      isUpdating={isUpdating}
      isDeleting={isDeleting}
    />
  );
} 