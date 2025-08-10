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
          value={duration}
          onChange={(e) => onDurationChange(Number(e.target.value))}
          min="1"
          max="999"
          required
        />
      )}

      {type === 'pomodoro' && (
        <div className="grid grid-cols-2 gap-1">
          <Input
            type="number"
            label="作業時間（分）"
            value={workDuration}
            onChange={(e) => onWorkDurationChange(Number(e.target.value))}
            min="1"
            max="999"
            required
          />
          <Input
            type="number"
            label="休憩時間（分）"
            value={breakDuration}
            onChange={(e) => onBreakDurationChange(Number(e.target.value))}
            min="1"
            max="999"
            required
          />
        </div>
      )}
    </div>
  );
} 