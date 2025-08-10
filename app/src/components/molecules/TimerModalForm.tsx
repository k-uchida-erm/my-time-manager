import React from 'react';
import { TimerFormFields } from './TimerFormFields';
import { ColorPicker } from '../atoms/form';
import { ToggleItem } from '../atoms/ui';
import { DeleteSection } from './DeleteSection';
import { TimerModalActions } from './TimerModalActions';
import { CustomTimer } from './TimerCreationModal';

interface TimerModalFormProps {
  title: string;
  onTitleChange: (title: string) => void;
  type: 'countdown' | 'stopwatch' | 'pomodoro';
  onTypeChange: (type: 'countdown' | 'stopwatch' | 'pomodoro') => void;
  duration: number;
  onDurationChange: (duration: number) => void;
  workDuration: number;
  onWorkDurationChange: (duration: number) => void;
  breakDuration: number;
  onBreakDurationChange: (duration: number) => void;
  color: string;
  onColorChange: (color: string) => void;
  hasMemo: boolean;
  onHasMemoChange: (hasMemo: boolean) => void;
  enableNotifications: boolean;
  onEnableNotificationsChange: (enabled: boolean) => void;
  availableColors: Array<{ value: string; label: string }>;
  isEditing: boolean;
  canSave: boolean;
  onDelete?: () => void;
  onCancel: () => void;
  onSubmit: () => void;
  className?: string;
}

export function TimerModalForm({
  title,
  onTitleChange,
  type,
  onTypeChange,
  duration,
  onDurationChange,
  workDuration,
  onWorkDurationChange,
  breakDuration,
  onBreakDurationChange,
  color,
  onColorChange,
  hasMemo,
  onHasMemoChange,
  enableNotifications,
  onEnableNotificationsChange,
  availableColors,
  isEditing,
  canSave,
  onDelete,
  onCancel,
  onSubmit,
  className = ""
}: TimerModalFormProps) {
  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(); }} className={`space-y-4 ${className}`}>
      <TimerFormFields
        title={title}
        onTitleChange={onTitleChange}
        type={type}
        onTypeChange={onTypeChange}
        duration={duration}
        onDurationChange={onDurationChange}
        workDuration={workDuration}
        onWorkDurationChange={onWorkDurationChange}
        breakDuration={breakDuration}
        onBreakDurationChange={onBreakDurationChange}
      />

      <ColorPicker
        colors={availableColors}
        selectedColor={color}
        onColorChange={onColorChange}
      />

      <ToggleItem
        title="メモ機能"
        description="記録時にメモを入力する"
        checked={hasMemo}
        onChange={onHasMemoChange}
      />

      <ToggleItem
        title="通知機能"
        description="タイマーが完了した時にブラウザ通知を送信"
        checked={enableNotifications}
        onChange={onEnableNotificationsChange}
      />

      {/* 削除セクション - 編集モード時のみ表示 */}
      {isEditing && onDelete && (
        <DeleteSection onDelete={onDelete} />
      )}

      <TimerModalActions
        isEditing={isEditing}
        canSave={canSave}
        onCancel={onCancel}
        onSubmit={onSubmit}
      />
    </form>
  );
} 