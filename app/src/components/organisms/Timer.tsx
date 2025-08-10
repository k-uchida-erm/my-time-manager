'use client'
import { useState, useEffect, useRef } from 'react'
import { addTimeEntry, deleteCustomTimer } from '@/app/actions'
import { CustomTimer } from '../molecules/CustomTimer'
import { CustomTimer as CustomTimerType } from '../molecules/TimerCreationModal'
import { Tabs, Button } from '../atoms/ui'
import { LoadingSpinner } from '../atoms/feedback'
import { TimerEmptyState } from '../molecules/TimerEmptyState'
import type { TimeEntry } from '@/lib/types'

// CustomTimer コンポーネント用のリセットハンドル
interface CustomTimerHandle {
  handleReset: () => void;
}

type TimerProps = {
  customTimers: CustomTimerType[];
  isLoading: boolean;
  onModalOpen?: () => void;
  onEditTimer?: (timer: CustomTimerType) => void;
  onNewEntry?: (entry: TimeEntry) => void;
}

export function Timer({ customTimers, isLoading, onModalOpen, onEditTimer, onNewEntry }: TimerProps) {
  const [activeTimerId, setActiveTimerId] = useState<string | null>(null)
  const [note, setNote] = useState('')
  const customTimerRef = useRef<CustomTimerHandle | null>(null)

  // 初期化時にアクティブタイマーを設定
  useEffect(() => {
    if (customTimers.length > 0 && !activeTimerId) {
      setActiveTimerId(customTimers[0].id)
    }
  }, [customTimers, activeTimerId])

  const handleCustomTimerComplete = async (duration: number) => {
    const formData = new FormData()
    
    // ストップウォッチの場合は実際の開始時刻を記録
    const now = Date.now()
    const startTime = now - (duration * 1000)
    
    formData.append('startTime', String(startTime))
    formData.append('endTime', String(now))
    formData.append('note', note || activeTimer.title) // メモがない場合はタイマーのタイトルを使用
    formData.append('timerTitle', activeTimer.title) // タイマーのタイトルを保存
    formData.append('timerColor', activeTimer.color) // タイマーの色を保存
    
    try {
      const result = await addTimeEntry(formData)
      
      if (result?.error) {
        console.error('Server returned error:', result.error)
        alert(`記録に失敗しました: ${result.error}`)
      } else {
        setNote('') // 記録後にメモをクリア
        
        // 新しい記録をタイムラインに追加
        if (onNewEntry) {
          const newEntry: TimeEntry = {
            id: Date.now(), // 仮のID（実際のIDはサーバーから返される）
            start_time: new Date(startTime).toISOString(),
            end_time: new Date(now).toISOString(),
            duration_seconds: duration,
            note: note || activeTimer.title,
            timer_title: activeTimer.title,
            timer_color: activeTimer.color,
            is_edited: false
          };
          onNewEntry(newEntry);
        }
      }
    } catch (error) {
      console.error('Failed to add time entry:', error)
      alert('記録に失敗しました。エラーを確認してください。')
    }
  }

  const handleEditTimer = (timer: CustomTimerType) => {
    onEditTimer?.(timer)
  }

  // ローディング中
  if (isLoading) {
    return (
      <div className="p-12">
        <LoadingSpinner message="タイマーを読み込み中..." />
      </div>
    )
  }

  // タイマーがない場合の初期表示
  if (customTimers.length === 0) {
    return (
      <div className="p-12">
        <TimerEmptyState onCreateTimer={() => onModalOpen?.()} />
      </div>
    )
  }

  // タブの設定
  const tabs = customTimers.map(timer => ({
    id: timer.id,
    label: timer.title,
    icon: null,
    color: timer.color
  }))

  // アクティブなタイマーを取得
  const activeTimer = customTimers.find(timer => timer.id === activeTimerId) || customTimers[0]

  return (
    <div className="space-y-0">
      {/* タブヘッダー */}
      <div className="flex items-center justify-between">
        <Tabs 
          tabs={tabs} 
          activeTab={activeTimerId || customTimers[0]?.id || ''} 
          onTabChange={(tabId) => setActiveTimerId(tabId)}
          onEditTab={(tabId) => {
            const timer = customTimers.find(t => t.id === tabId);
            if (timer) {
              onEditTimer?.(timer);
            }
          }}
          onDeleteTab={(tabId) => {
            // 削除確認
            if (confirm('このタイマーを削除しますか？')) {
              const formData = new FormData();
              formData.append('id', tabId);
              deleteCustomTimer(formData).then((result) => {
                if ((result as { error?: string }).error) {
                  const { error } = result as { error?: string };
                  alert(`タイマーの削除に失敗しました: ${error}`);
                } else {
                  // タイマーリストを更新
                  window.location.reload(); // 簡単な方法としてリロード
                }
              });
            }
          }}
        />
        
        {/* + ボタン（最大8個制限） */}
        <div className="w-10 h-10 flex items-center justify-center">
          <button
            onClick={() => onModalOpen?.()}
            disabled={customTimers.length >= 8}
            className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ease-out focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105
              ${customTimers.length >= 8
                ? 'bg-muted text-muted-foreground cursor-not-allowed'
                : 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg hover:shadow-xl'}
            `}
            title={customTimers.length >= 8 ? '最大8個までです' : '新しいタイマーを追加'}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>
      </div>
      
      {/* セクションコンテンツの大きな枠 */}
      <div className="bg-white/80 backdrop-blur-sm border-l border-r border-b border-gray-200 rounded-b-2xl p-6">
        {/* アクティブタイマー */}
        <div className="relative">
          <CustomTimer 
            ref={customTimerRef}
            timer={activeTimer}
            onComplete={handleCustomTimerComplete}
            onReset={() => {
              // リセット機能はCustomTimer内で処理される
            }}
          />
          
          {/* 右側のボタン群 */}
          <div className="absolute top-4 right-4 flex flex-col gap-2">
            {/* 編集ボタン */}
            <button
              onClick={() => handleEditTimer(activeTimer)}
              className="w-10 h-10 bg-muted text-muted-foreground rounded-full flex items-center justify-center hover:bg-muted/80 transition-colors"
              title="編集"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
            
            {/* リセットボタン */}
            <button
              onClick={() => {
                // リセット確認
                if (confirm('タイマーをリセットしますか？')) {
                  // CustomTimer 側のハンドルを利用してリセット
                  customTimerRef.current?.handleReset();
                }
              }}
              className="w-10 h-10 bg-muted text-muted-foreground rounded-full flex items-center justify-center hover:bg-muted/80 transition-colors"
              title="リセット"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          </div>
        </div>
        
        {/* メモ入力（枠の外） */}
        <div className="mt-4">
          {/* メモ入力（hasMemoがtrueの場合のみ表示） */}
          {activeTimer.hasMemo && (
            <div>
              <label className="block text-sm font-medium text-foreground mb-3">
                メモ
              </label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="メモを入力"
                className="w-full p-4 border border-gray-200 rounded-xl bg-white text-gray-900 resize-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-all duration-200"
                rows={3}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 