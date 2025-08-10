import React from 'react';
import { Input, Select } from '../atoms/form';

interface TimerFormFieldsProps {
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
  className?: string;
}

const TIMER_TYPES = [
  { value: 'countdown', label: 'カウントダウン' },
  { value: 'stopwatch', label: 'ストップウォッチ' },
  { value: 'pomodoro', label: 'ポモドーロ' },
];

export function TimerFormFields({
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
  className = ""
}: TimerFormFieldsProps) {
  
  const handleDurationChange = (value: string) => {
    if (value === '') {
      // 空文字列の場合は0を設定（一時的に空にできるように）
      onDurationChange(0);
    } else {
      const numValue = Number(value);
      if (!isNaN(numValue) && numValue >= 0) {
        onDurationChange(Math.max(0, Math.min(999, numValue)));
      }
    }
  };

  const handleWorkDurationChange = (value: string) => {
    if (value === '') {
      onWorkDurationChange(0);
    } else {
      const numValue = Number(value);
      if (!isNaN(numValue) && numValue >= 0) {
        onWorkDurationChange(Math.max(0, Math.min(999, numValue)));
      }
    }
  };

  const handleBreakDurationChange = (value: string) => {
    if (value === '') {
      onBreakDurationChange(0);
    } else {
      const numValue = Number(value);
      if (!isNaN(numValue) && numValue >= 0) {
        onBreakDurationChange(Math.max(0, Math.min(999, numValue)));
      }
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <Input
        type="text"
        label="タイトル"
        value={title}
        onChange={(e) => onTitleChange(e.target.value)}
        placeholder="タイトルを入力"
        required
      />

      <Select
        label="タイマー形式"
        value={type}
        onChange={(value) => onTypeChange(value as 'countdown' | 'stopwatch' | 'pomodoro')}
        options={TIMER_TYPES}
        required
      />

      {type === 'countdown' && (
        <Input
          type="number"
          label="時間（分）"
          value={duration === 0 ? '' : duration}
          onChange={(e) => handleDurationChange(e.target.value)}
          min="0"
          max="999"
          placeholder="時間を入力"
          required
        />
      )}

      {type === 'pomodoro' && (
        <div className="grid grid-cols-2 gap-1">
          <Input
            type="number"
            label="作業時間（分）"
            value={workDuration === 0 ? '' : workDuration}
            onChange={(e) => handleWorkDurationChange(e.target.value)}
            min="0"
            max="999"
            placeholder="作業時間"
            required
          />
          <Input
            type="number"
            label="休憩時間（分）"
            value={breakDuration === 0 ? '' : breakDuration}
            onChange={(e) => handleBreakDurationChange(e.target.value)}
            min="0"
            max="999"
            placeholder="休憩時間"
            required
          />
        </div>
      )}
    </div>
  );
} 