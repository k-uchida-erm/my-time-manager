import React from 'react';
import { Button } from '../atoms/ui';

interface TimerModalActionsProps {
  isEditing: boolean;
  canSave: boolean;
  onCancel: () => void;
  onSubmit: () => void;
  className?: string;
}

export function TimerModalActions({
  isEditing,
  canSave,
  onCancel,
  onSubmit,
  className = ""
}: TimerModalActionsProps) {
  return (
    <div className={`flex gap-3 pt-2 ${className}`}>
      <Button
        type="button"
        variant="outline"
        size="lg"
        onClick={onCancel}
        className="flex-1 whitespace-nowrap"
        icon={
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        }
      >
        キャンセル
      </Button>
      <Button
        type="submit"
        variant="primary"
        size="lg"
        className="flex-1 whitespace-nowrap"
        disabled={!canSave}
        onClick={onSubmit}
        icon={
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        }
      >
        {isEditing ? '更新' : '作成'}
      </Button>
    </div>
  );
} 