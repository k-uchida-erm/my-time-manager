import React from 'react';
import { Button } from '../atoms/ui';

interface DeleteSectionProps {
  onDelete: () => void;
  className?: string;
}

export function DeleteSection({ onDelete, className = "" }: DeleteSectionProps) {
  return (
    <div className={`flex items-center justify-between p-2 bg-red-50 rounded-lg border border-red-200 ${className}`}>
      <div>
        <h4 className="text-sm font-medium text-red-800">タイマーを削除</h4>
        <p className="text-xs text-red-600 mt-1">
          このタイマーを完全に削除します。
          <br />
          この操作は取り消せません。
        </p>
      </div>
      <Button
        type="button"
        variant="destructive"
        size="md"
        onClick={onDelete}
        className="text-white"
        icon={
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        }
      >
        削除
      </Button>
    </div>
  );
} 