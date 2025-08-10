import React, { useState, useEffect } from 'react';
import { TimeEntry } from '@/lib/types';
import { Button } from '../atoms/ui';

interface TimeEntryEditFormProps {
  entry: TimeEntry;
  onSave: (entry: TimeEntry) => void;
  onDelete: (entryId: number) => void;
  onCancel: () => void;
  className?: string;
}

export function TimeEntryEditForm({ 
  entry, 
  onSave, 
  onDelete, 
  onCancel, 
  className = "" 
}: TimeEntryEditFormProps) {
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [note, setNote] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // 初期値を設定
  useEffect(() => {
    if (entry) {
      // ISO文字列からローカル時間に変換
      const startDate = new Date(entry.start_time);
      const endDate = new Date(entry.end_time);
      
      // input[type="time"]の形式（HH:mm）に変換
      const formatTimeForInput = (date: Date) => {
        return date.toTimeString().slice(0, 5); // HH:mm形式
      };
      
      setStartTime(formatTimeForInput(startDate));
      setEndTime(formatTimeForInput(endDate));
      setNote(entry.note || '');
    }
  }, [entry]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // 時間のバリデーション
    if (!startTime || !endTime) {
      alert('開始時間と終了時間を入力してください');
      return;
    }
    
    // 時間文字列をDateオブジェクトに変換
    const today = new Date();
    const [startHour, startMinute] = startTime.split(':').map(Number);
    const [endHour, endMinute] = endTime.split(':').map(Number);
    
    // 時間の妥当性チェック
    if (isNaN(startHour) || isNaN(startMinute) || isNaN(endHour) || isNaN(endMinute)) {
      alert('正しい時間形式で入力してください');
      return;
    }
    
    const startDate = new Date(today);
    startDate.setHours(startHour, startMinute, 0, 0);
    
    const endDate = new Date(today);
    endDate.setHours(endHour, endMinute, 0, 0);
    
    // 開始時間が終了時間より後ではないかチェック
    if (startDate >= endDate) {
      alert('開始時間は終了時間より前である必要があります');
      return;
    }

    const updatedEntry: TimeEntry = {
      ...entry,
      start_time: startDate.toISOString(),
      end_time: endDate.toISOString(),
      duration_seconds: Math.floor((endDate.getTime() - startDate.getTime()) / 1000),
      note: note.trim() || null,
      is_edited: true,
      edited_at: new Date().toISOString()
    };

    onSave(updatedEntry);
  };

  const handleDelete = () => {
    onDelete(entry.id);
    setShowDeleteConfirm(false);
  };

  return (
    <form onSubmit={handleSubmit} className={`space-y-1 ${className}`}>
      {/* 時間設定 - 横並びでコンパクトに */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">
            開始時間
          </label>
          <input
            type="time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            required
            className="w-full p-2 border border-border rounded-lg bg-background text-foreground"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">
            終了時間
          </label>
          <input
            type="time"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            required
            className="w-full p-2 border border-border rounded-lg bg-background text-foreground"
          />
        </div>
      </div>

      {/* メモ - 高さを調整 */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-1">
          メモ
        </label>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="メモを入力"
          className="w-full p-2 border border-border rounded-lg bg-background text-foreground resize-none"
          rows={3}
        />
      </div>

      {/* 削除セクション */}
      <div>
        <div className="flex items-center justify-between p-2 bg-red-50 rounded-lg border border-red-200">
          <div>
            <h4 className="text-sm font-medium text-red-800">記録を削除</h4>
            <p className="text-xs text-red-600 mt-1">
              この記録を完全に削除します。
              <br />
              この操作は取り消せません。
            </p>
          </div>
          <Button
            type="button"
            variant="destructive"
            size="md"
            onClick={() => setShowDeleteConfirm(true)}
            className="text-white"
            icon={
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 01 16.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            }
          >
            削除
          </Button>
        </div>
      </div>

      {/* 削除確認 */}
      {showDeleteConfirm && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-800 mb-3 font-medium">本当に削除しますか？</p>
          <div className="flex gap-3">
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={handleDelete}
            >
              削除
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowDeleteConfirm(false)}
            >
              キャンセル
            </Button>
          </div>
        </div>
      )}

      {/* ボタン群 */}
      <div className="flex gap-3 pt-2">
        <Button
          type="button"
          variant="outline"
          size="md"
          onClick={onCancel}
          className="flex-1"
          icon={
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          }
        >
          キャンセル
        </Button>
        <Button
          type="submit"
          variant="primary"
          size="md"
          className="flex-1"
          icon={
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          }
        >
          保存
        </Button>
      </div>
    </form>
  );
} 