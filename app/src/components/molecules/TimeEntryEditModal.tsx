'use client'
import { BaseModal } from '../organisms/BaseModal';
import { TimeEntryEditForm } from './TimeEntryEditForm';
import { TimeEntry } from '@/lib/types';

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
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="記録を編集"
      maxWidth="max-w-lg"
    >
      <div className="space-y-1">
        {/* タイマー情報表示 */}
        <div className="p-3 bg-muted rounded-lg border border-gray-200">
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
        </div>
        
        <TimeEntryEditForm
          entry={entry}
          onSave={handleSave}
          onDelete={handleDelete}
          onCancel={onClose}
        />
      </div>
    </BaseModal>
  );
} 