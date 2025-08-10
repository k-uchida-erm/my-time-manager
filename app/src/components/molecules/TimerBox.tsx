import React, { useState, useEffect } from 'react';
import { GradientBackground } from '../atoms/ui';
import { Timer } from '../organisms/Timer';
import { TimerCreationModal } from './TimerCreationModal';
import { CustomTimer as CustomTimerType } from './TimerCreationModal';
import { getCustomTimers, saveCustomTimer, updateCustomTimer, deleteCustomTimer } from '@/app/actions';
import { TimerContentTitle } from './TimerContentTitle';
import { TimeEntry } from '@/lib/types';

interface TimerBoxProps {
  onNewEntry?: (entry: TimeEntry) => void;
  onTimerCreated?: (timerId: string) => void;
}

// DBのカスタムタイマー行の型
type DbCustomTimerRow = {
  id: string;
  title: string;
  type: 'countdown' | 'stopwatch' | 'pomodoro';
  duration: number | null;
  work_duration: number | null;
  break_duration: number | null;
  color: string;
  has_memo: boolean;
  enable_notifications?: boolean | null;
};

export function TimerBox({ 
  onNewEntry,
  onTimerCreated 
}: TimerBoxProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTimer, setEditingTimer] = useState<CustomTimerType | null>(null);
  const [customTimers, setCustomTimers] = useState<CustomTimerType[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // 初期化時にDBからタイマー設定を読み込み
  useEffect(() => {
    loadCustomTimers();
  }, []);

  const loadCustomTimers = async () => {
    try {
      const result = await getCustomTimers();
      
      if (result.error) {
        console.error('Failed to load custom timers:', result.error);
        setCustomTimers([]);
        return;
      }
      
      if (result.data) {
        const timers = result.data.map((timer: DbCustomTimerRow) => ({
          id: timer.id,
          title: timer.title,
          type: timer.type,
          duration: timer.duration ?? undefined,
          workDuration: timer.work_duration ?? undefined,
          breakDuration: timer.break_duration ?? undefined,
          color: timer.color,
          hasMemo: timer.has_memo,
          enableNotifications: timer.enable_notifications ?? false // 通知設定を追加
        }));

        setCustomTimers(timers);
      }
    } catch (error) {
      console.error('Failed to load custom timers:', error);
      setCustomTimers([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateTimer = async (timer: CustomTimerType) => {
    try {
      const formData = new FormData();
      formData.append('title', timer.title);
      formData.append('type', timer.type);
      formData.append('duration', timer.duration?.toString() || '25');
      formData.append('workDuration', timer.workDuration?.toString() || '25');
      formData.append('breakDuration', timer.breakDuration?.toString() || '5');
      formData.append('color', timer.color);
      formData.append('hasMemo', timer.hasMemo?.toString() || 'true');
      formData.append('enableNotifications', timer.enableNotifications?.toString() || 'false');

      const result = await saveCustomTimer(formData);
      
      if (result?.error) {
        console.error('Timer creation failed:', result.error);
        alert(`タイマーの作成に失敗しました: ${result.error}`);
        return;
      }

      if (result?.timer) {
        // 新しいタイマーのlocalStorageをクリア（クリーンな状態で開始）
        localStorage.removeItem(`timer_${result.timer.id}`);
        
        // 新しいタイマーをリストに追加
        setCustomTimers(prev => [...prev, result.timer]);
        setIsModalOpen(false);
        
        // 新しく作成したタイマーをアクティブに設定
        if (onTimerCreated) {
          onTimerCreated(result.timer.id);
        }
        
        // タイマーリストを再読み込みして同期を確保
        await loadCustomTimers();
      } else {
        console.error('Timer created but no timer data returned');
        alert('タイマーの作成に失敗しました：データが返されませんでした');
      }
    } catch (error) {
      console.error('Failed to create timer:', error);
      alert('タイマーの作成に失敗しました');
    }
  };

  const handleUpdateTimer = async (timer: CustomTimerType) => {
    try {
      const formData = new FormData();
      formData.append('id', timer.id);
      formData.append('title', timer.title);
      formData.append('type', timer.type);
      formData.append('duration', timer.duration?.toString() || '25');
      formData.append('workDuration', timer.workDuration?.toString() || '25');
      formData.append('breakDuration', timer.breakDuration?.toString() || '5');
      formData.append('color', timer.color);
      formData.append('hasMemo', timer.hasMemo?.toString() || 'true');
      formData.append('enableNotifications', timer.enableNotifications?.toString() || 'false');

      const result = await updateCustomTimer(formData);
      
      if (result?.error) {
        console.error('Timer update failed:', result.error);
        alert(`タイマーの更新に失敗しました: ${result.error}`);
        return;
      }

      if (result?.timer) {
        // サーバーから返された正しいデータでタイマーを更新
        setCustomTimers(prev => 
          prev.map(t => t.id === timer.id ? result.timer : t)
        );
        setIsModalOpen(false);
        setEditingTimer(null);
        
        // タイマーリストを再読み込みして同期を確保
        await loadCustomTimers();
      } else {
        console.error('Timer updated but no timer data returned');
        alert('タイマーの更新に失敗しました：データが返されませんでした');
      }
    } catch (error) {
      console.error('Failed to update timer:', error);
      alert('タイマーの更新に失敗しました');
    }
  };

  const handleDeleteTimer = async (timerId: string) => {
    try {
      const formData = new FormData();
      formData.append('id', timerId);

      const result = await deleteCustomTimer(formData);
      
      if (result?.error) {
        alert(`タイマーの削除に失敗しました: ${result.error}`);
        return;
      }

      setCustomTimers(prev => prev.filter(t => t.id !== timerId));
    } catch (error) {
      console.error('Failed to delete timer:', error);
      alert('タイマーの削除に失敗しました');
    }
  };

  return (
    <>
      <div className="space-y-6">
        {/* ヘッダー */}
        <TimerContentTitle />
        
        {/* タイマーコンテンツ */}
        <Timer 
          customTimers={customTimers}
          isLoading={isLoading}
          onModalOpen={() => setIsModalOpen(true)}
          onEditTimer={(timer) => {
            setEditingTimer(timer);
            setIsModalOpen(true);
          }}
          onDeleteTimer={handleDeleteTimer}
          onNewEntry={onNewEntry}
        />
      </div>

      {/* タイマー作成・編集モーダル */}
      <TimerCreationModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingTimer(null);
        }}
        onSave={editingTimer ? handleUpdateTimer : handleCreateTimer}
        onDelete={handleDeleteTimer}
        editingTimer={editingTimer}
        existingTimers={customTimers}
      />
    </>
  );
} 