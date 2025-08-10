'use client'
import { TimeEntryEditForm } from './TimeEntryEditForm';
import { TimeEntry } from '@/lib/types';
import { Button } from '../atoms/ui';

interface TimeEntryEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (entry: TimeEntry) => void;
  onDelete: (entryId: number) => void;
  entry: TimeEntry | null;
}

export function TimeEntryEditModal({ 
  isOpen, 
  onClose, 
  onSave, 
  onDelete, 
  entry
}: TimeEntryEditModalProps) {
  if (!isOpen || !entry) return null;

  const handleSave = (updatedEntry: TimeEntry) => {
    onSave(updatedEntry);
    onClose();
  };

  const handleDelete = (entryId: number) => {
    onDelete(entryId);
    onClose();
  };

  return (
    <div className="absolute top-4 right-4 w-96 bg-white border border-gray-200 rounded-xl shadow-lg z-50">
      {/* ヘッダー */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div 
            className="w-4 h-4 rounded-full border-2 border-gray-300"
            style={{ backgroundColor: entry.timer_color || '#3B82F6' }}
          />
          <div>
            <h4 className="text-sm font-medium text-foreground">
              {entry.timer_title || 'タイマー'}の記録
            </h4>
            <p className="text-xs text-muted-foreground">時間とメモを変更できます</p>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="p-1 h-8 w-8 rounded-md border border-gray-300 hover:bg-gray-50 flex items-center justify-center"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      
      {/* コンテンツ */}
      <div className="p-4">
        <TimeEntryEditForm
          entry={entry}
          onSave={handleSave}
          onDelete={handleDelete}
          onCancel={onClose}
        />
      </div>
    </div>
  );
} 