import React, { useState } from 'react';
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

// 通知ガイドコンポーネント
function NotificationGuide({ isVisible }: { isVisible: boolean }) {
  if (!isVisible) return null;

  const userAgent = typeof window !== 'undefined' ? window.navigator.userAgent : '';
  const isChrome = userAgent.includes('Chrome') && !userAgent.includes('Edge');
  const isFirefox = userAgent.includes('Firefox');
  const isSafari = userAgent.includes('Safari') && !userAgent.includes('Chrome');
  const isMac = userAgent.includes('Mac');
  const isWindows = userAgent.includes('Windows');

  return (
    <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm">
      <div className="flex items-start gap-2">
        <div className="text-blue-600 mt-0.5">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="flex-1">
          <p className="font-medium text-blue-800 mb-2">📢 通知設定ガイド</p>
          
          {/* ブラウザ設定 */}
          <div className="mb-3">
            <p className="font-medium text-blue-700 mb-1">🌐 ブラウザ設定:</p>
            {isChrome && (
              <p className="text-blue-600">Chrome: アドレスバー左の🔒 → 「通知」を「許可」に設定</p>
            )}
            {isFirefox && (
              <p className="text-blue-600">Firefox: アドレスバー左の盾アイコン → 通知を許可</p>
            )}
            {isSafari && (
              <p className="text-blue-600">Safari: 環境設定 → Webサイト → 通知 → このサイトを許可</p>
            )}
          </div>

          {/* OS設定 */}
          <div className="mb-3">
            <p className="font-medium text-blue-700 mb-1">💻 システム設定:</p>
            {isMac && (
              <p className="text-blue-600">macOS: システム環境設定 → 通知とフォーカス → {isChrome ? 'Chrome' : isSafari ? 'Safari' : 'ブラウザ'}の通知をオン</p>
            )}
            {isWindows && (
              <p className="text-blue-600">Windows: 設定 → システム → 通知とアクション → {isChrome ? 'Chrome' : 'ブラウザ'}の通知をオン</p>
            )}
          </div>

          {/* 注意事項 */}
          <div className="text-xs text-blue-600 border-t border-blue-200 pt-2">
            <p>💡 通知が表示されない場合:</p>
            <ul className="list-disc list-inside mt-1 space-y-1">
              <li>ブラウザで一度「拒否」した場合は、手動で許可設定が必要</li>
              <li>おやすみモード/集中モードが無効になっているか確認</li>
              <li>通知はタイマー完了時に画面の隅に表示されます</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
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
  const [showNotificationGuide, setShowNotificationGuide] = useState(false);

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

      <div>
        <ToggleItem
          title={
            <div className="flex items-center gap-2">
              <span>通知機能</span>
              <button
                type="button"
                onClick={() => setShowNotificationGuide(!showNotificationGuide)}
                className="text-blue-600 hover:text-blue-700 text-xs font-medium underline"
              >
                設定ガイド
              </button>
            </div>
          }
          description="タイマーが完了した時にブラウザ通知を送信"
          checked={enableNotifications}
          onChange={onEnableNotificationsChange}
        />
        
        <NotificationGuide isVisible={showNotificationGuide} />
      </div>

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