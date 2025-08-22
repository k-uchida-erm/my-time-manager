'use client'
import { useState, useEffect } from 'react';
import { BaseModal } from '../organisms/BaseModal';
import { TimerModalForm } from './TimerModalForm';

export interface CustomTimer {
  id: string;
  title: string;
  type: 'countdown' | 'stopwatch' | 'pomodoro';
  duration?: number; // 分単位（countdown用）
  workDuration?: number; // 分単位（pomodoro用）
  breakDuration?: number; // 分単位（pomodoro用）
  color: string;
  hasMemo: boolean; // メモ機能の有無
  enableNotifications?: boolean; // 通知設定
}

interface TimerCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (timer: CustomTimer) => void;
  onDelete?: (timerId: string) => void; // 削除機能を追加
  editingTimer?: CustomTimer | null;
  existingTimers?: CustomTimer[]; // 既存のタイマーリスト
}

const TIMER_COLORS = [
  { value: '#3b82f6', label: '青' },
  { value: '#10b981', label: '緑' },
  { value: '#f59e0b', label: 'オレンジ' },
  { value: '#8b5cf6', label: '紫' },
  { value: '#ef4444', label: '赤' },
  { value: '#06b6d4', label: 'シアン' },
  { value: '#f97316', label: 'オレンジ' },
  { value: '#ec4899', label: 'ピンク' },
];

export function TimerCreationModal({ isOpen, onClose, onSave, onDelete, editingTimer, existingTimers = [] }: TimerCreationModalProps) {
  const [title, setTitle] = useState('');
  const [type, setType] = useState<'countdown' | 'stopwatch' | 'pomodoro'>('countdown');
  const [duration, setDuration] = useState(25);
  const [workDuration, setWorkDuration] = useState(25);
  const [breakDuration, setBreakDuration] = useState(5);
  const [color, setColor] = useState('#3b82f6');
  const [hasMemo, setHasMemo] = useState(true);
  const [enableNotifications, setEnableNotifications] = useState(true);

  // 全ての色を利用可能にする（重複許可）
  const availableColors = TIMER_COLORS;

  // 編集モードの場合、既存のデータを設定
  useEffect(() => {
    if (editingTimer) {
      setTitle(editingTimer.title);
      setType(editingTimer.type);
      setDuration(editingTimer.duration || 25);
      setWorkDuration(editingTimer.workDuration || 25);
      setBreakDuration(editingTimer.breakDuration || 5);
      setColor(editingTimer.color);
      setHasMemo(editingTimer.hasMemo);
      setEnableNotifications(editingTimer.enableNotifications ?? false); // ?? を使用して明示的にfalseを許可
    } else {
      // 新規作成モードの場合、デフォルト値を設定
      setTitle('');
      setType('countdown');
      setDuration(25);
      setWorkDuration(25);
      setBreakDuration(5);
      setColor(availableColors[0]?.value || '#3b82f6');
      setHasMemo(true);
      setEnableNotifications(true); // 新規作成時はデフォルトでtrue
    }
  }, [editingTimer, isOpen, availableColors]);

  const handleFormSubmit = () => {
    const timer: CustomTimer = {
      id: editingTimer?.id || crypto.randomUUID(), // UUIDを生成
      title,
      type,
      color,
      hasMemo,
      enableNotifications: type === 'stopwatch' ? false : enableNotifications,
      ...(type === 'countdown' && { duration }),
      ...(type === 'pomodoro' && { workDuration, breakDuration }),
    };

    onSave(timer);
    handleClose();
  };

  const handleClose = () => {
    setTitle('');
    setType('countdown');
    setDuration(25);
    setWorkDuration(25);
    setBreakDuration(5);
    setColor('#3b82f6');
    setHasMemo(true);
    setEnableNotifications(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={handleClose}
      title={editingTimer ? 'タイマーを編集' : '新しいタイマーを作成'}
    >
      <TimerModalForm
        title={title}
        onTitleChange={setTitle}
        type={type}
        onTypeChange={setType}
        duration={duration}
        onDurationChange={setDuration}
        workDuration={workDuration}
        onWorkDurationChange={setWorkDuration}
        breakDuration={breakDuration}
        onBreakDurationChange={setBreakDuration}
        color={color}
        onColorChange={setColor}
        hasMemo={hasMemo}
        onHasMemoChange={setHasMemo}
        enableNotifications={enableNotifications}
        onEnableNotificationsChange={setEnableNotifications}
        availableColors={availableColors}
        isEditing={!!editingTimer}
        canSave={!!title.trim()}
        onDelete={editingTimer && onDelete ? () => {
          onDelete(editingTimer.id);
          handleClose();
        } : undefined}
        onCancel={handleClose}
        onSubmit={handleFormSubmit}
      />
    </BaseModal>
  );
} 