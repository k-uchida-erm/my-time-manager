import React, { useState } from 'react';
import { TimeEntry } from '@/lib/types';
import { Button } from '../atoms/ui';
import { Input } from '../atoms/form';

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
  
  const [note, setNote] = useState(entry?.note || '');
  
  // 開始時間と終了時間を Date オブジェクトから時分秒に分解
  const startDate = new Date(entry?.start_time || new Date());
  const endDate = new Date(entry?.end_time || new Date());
  
  const [startHours, setStartHours] = useState(startDate.getHours());
  const [startMinutes, setStartMinutes] = useState(startDate.getMinutes());
  const [startSeconds, setStartSeconds] = useState(startDate.getSeconds());
  
  const [endHours, setEndHours] = useState(endDate.getHours());
  const [endMinutes, setEndMinutes] = useState(endDate.getMinutes());
  const [endSeconds, setEndSeconds] = useState(endDate.getSeconds());

  const handleSave = () => {
    // 新しい開始時間と終了時間を作成
    const today = new Date(entry?.start_time || new Date());
    
    const newStartTime = new Date(today);
    newStartTime.setHours(startHours, startMinutes, startSeconds, 0);
    
    const newEndTime = new Date(today);
    newEndTime.setHours(endHours, endMinutes, endSeconds, 0);
    
    // 開始時間が終了時間より後ではないかチェック
    if (newStartTime >= newEndTime) {
      alert('開始時間は終了時間より前である必要があります');
      return;
    }
    
    // 時間差を計算
    const durationSeconds = Math.floor((newEndTime.getTime() - newStartTime.getTime()) / 1000);
    
    if (durationSeconds <= 0) {
      alert('時間は1秒以上である必要があります');
      return;
    }

    const updatedEntry: TimeEntry = {
      ...entry!,
      start_time: newStartTime.toISOString(),
      end_time: newEndTime.toISOString(),
      duration_seconds: durationSeconds,
      note: note.trim(),
      is_edited: true,
      edited_at: new Date().toISOString()
    };

    onSave(updatedEntry);
  };

  const handleDelete = () => {
    onDelete(entry!.id);
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* 開始時間編集 */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">
          開始時間
        </label>
        <div className="flex items-center gap-1">
          <div className="flex-1">
            <Input
              type="number"
              value={startHours}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setStartHours(Math.max(0, Math.min(23, parseInt(e.target.value) || 0)))}
              placeholder="00"
              min="0"
              max="23"
              className="text-center"
            />
          </div>
          <span className="text-gray-500">:</span>
          <div className="flex-1">
            <Input
              type="number"
              value={startMinutes}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setStartMinutes(Math.max(0, Math.min(59, parseInt(e.target.value) || 0)))}
              placeholder="00"
              min="0"
              max="59"
              className="text-center"
            />
          </div>
          <span className="text-gray-500">:</span>
          <div className="flex-1">
            <Input
              type="number"
              value={startSeconds}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setStartSeconds(Math.max(0, Math.min(59, parseInt(e.target.value) || 0)))}
              placeholder="00"
              min="0"
              max="59"
              className="text-center"
            />
          </div>
        </div>
      </div>

      {/* 終了時間編集 */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">
          終了時間
        </label>
        <div className="flex items-center gap-1">
          <div className="flex-1">
            <Input
              type="number"
              value={endHours}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEndHours(Math.max(0, Math.min(23, parseInt(e.target.value) || 0)))}
              placeholder="00"
              min="0"
              max="23"
              className="text-center"
            />
          </div>
          <span className="text-gray-500">:</span>
          <div className="flex-1">
            <Input
              type="number"
              value={endMinutes}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEndMinutes(Math.max(0, Math.min(59, parseInt(e.target.value) || 0)))}
              placeholder="00"
              min="0"
              max="59"
              className="text-center"
            />
          </div>
          <span className="text-gray-500">:</span>
          <div className="flex-1">
            <Input
              type="number"
              value={endSeconds}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEndSeconds(Math.max(0, Math.min(59, parseInt(e.target.value) || 0)))}
              placeholder="00"
              min="0"
              max="59"
              className="text-center"
            />
          </div>
        </div>
      </div>

      {/* メモ編集 */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">
          メモ
        </label>
        <textarea
          value={note}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNote(e.target.value)}
          placeholder="メモを入力してください（任意）"
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
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
          <button
            type="button"
            onClick={handleDelete}
            className="px-3 py-1 bg-red-600 text-white text-sm rounded-md hover:bg-red-700 flex items-center gap-1"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 01 16.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            削除
          </button>
        </div>
      </div>

      {/* ボタン群 */}
      <div className="flex gap-3 pt-2">
        <Button
          type="button"
          variant="outline"
          size="md"
          onClick={onCancel}
          className="flex-1"
        >
          キャンセル
        </Button>
        <Button
          type="button"
          variant="primary"
          size="md"
          onClick={handleSave}
          className="flex-1"
        >
          保存
        </Button>
      </div>
    </div>
  );
} 