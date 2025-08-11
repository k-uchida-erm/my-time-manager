'use client'
import { useState, useEffect, useRef, useMemo } from 'react'
import { addTimeEntry, deleteCustomTimer } from '@/app/actions'
import { CustomTimer } from '../molecules/CustomTimer'
import { CustomTimer as CustomTimerType } from '../molecules/TimerCreationModal'
import { Tabs } from '../atoms/ui'
import { LoadingSpinner } from '../atoms/feedback'
import { TimerEmptyState } from '../molecules/TimerEmptyState'
import type { TimeEntry } from '@/lib/types'
import { useTimerOrder } from '@/hooks/timer/useTimerOrder'

// CustomTimer コンポーネント用のリセットハンドル
interface CustomTimerHandle {
  handleReset: () => void;
}

type TimerProps = {
  customTimers: CustomTimerType[];
  isLoading: boolean;
  onModalOpen?: () => void;
  onEditTimer?: (timer: CustomTimerType) => void;
  onDeleteTimer?: (timerId: string) => void;
  onNewEntry?: (entry: TimeEntry) => void;
}

export function Timer({ customTimers, isLoading, onModalOpen, onEditTimer, onDeleteTimer, onNewEntry }: TimerProps) {
  const [activeTimerId, setActiveTimerId] = useState<string | null>(null)
  const [note, setNote] = useState('')
  const customTimerRef = useRef<CustomTimerHandle | null>(null)
  const activeTimerIdRef = useRef<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const { sortedTimers, handleReorder } = useTimerOrder(customTimers)

  // タイマーIDのリストを安定化
  const timerIds = useMemo(() => customTimers.map(t => t.id), [customTimers]);
  const hasTimers = customTimers.length > 0;

  // 初期化処理（一度だけ実行）
  useEffect(() => {
    if (hasTimers && !isInitialized) {
      const savedActiveTimerId = localStorage.getItem('activeTimerId');
      
      if (savedActiveTimerId && sortedTimers.find(t => t.id === savedActiveTimerId)) {
        // 保存されたIDのタイマーが存在する場合
        setActiveTimerId(savedActiveTimerId);
        activeTimerIdRef.current = savedActiveTimerId;
      } else {
        // 新しいタイマーリストの最初のタイマーを選択
        setActiveTimerId(sortedTimers[0].id);
        activeTimerIdRef.current = sortedTimers[0].id;
      }
      
      setIsInitialized(true);
    }
  }, [hasTimers, isInitialized, sortedTimers]);

  // タイマーリストが変更された時の処理
  useEffect(() => {
    if (isInitialized && hasTimers) {
      // 現在のアクティブタイマーがまだ存在するかチェック
      const currentActiveExists = activeTimerId && sortedTimers.find(t => t.id === activeTimerId);
      
      if (!currentActiveExists) {
        // 存在しない場合は最初のタイマーを選択
        setActiveTimerId(sortedTimers[0].id);
        activeTimerIdRef.current = sortedTimers[0].id;
      }
    }
  }, [timerIds, isInitialized, hasTimers, activeTimerId, sortedTimers]);

  // activeTimerIdが変更されたらlocalStorageに保存
  useEffect(() => {
    if (activeTimerId) {
      localStorage.setItem('activeTimerId', activeTimerId);
      activeTimerIdRef.current = activeTimerId;
    } else {
      localStorage.removeItem('activeTimerId');
      activeTimerIdRef.current = null;
    }
  }, [activeTimerId]);

  const handleCustomTimerComplete = async (payload: { durationSeconds: number; startTimeMs: number; endTimeMs: number }) => {
    const formData = new FormData()
    
    const { durationSeconds, startTimeMs, endTimeMs } = payload
    
    formData.append('startTime', String(startTimeMs))
    formData.append('endTime', String(endTimeMs))
    formData.append('note', note || activeTimer.title) // メモがない場合はタイマーのタイトルを使用
    formData.append('timerTitle', activeTimer.title) // タイマーのタイトルを保存
    formData.append('timerColor', activeTimer.color) // タイマーの色を保存
    
    try {
      const result = await addTimeEntry(formData)
      
      if (result?.error) {
        console.error('Failed to add time entry:', result.error)
        alert(`記録に失敗しました: ${result.error}`)
        return
      }

      const newEntry: TimeEntry = {
        id: Date.now(),
        start_time: new Date(startTimeMs).toISOString(),
        end_time: new Date(endTimeMs).toISOString(),
        duration_seconds: durationSeconds,
        note: note || activeTimer.title,
        timer_title: activeTimer.title,
        timer_color: activeTimer.color
      }

      setNote('')
      
      if (onNewEntry) {
        onNewEntry(newEntry);
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
  const tabs = sortedTimers.map(timer => ({
    id: timer.id,
    label: timer.title,
    icon: null,
    color: timer.color
  }))

  // アクティブなタイマーを取得（初期描画時もlocalStorageの値を優先）
  const savedActiveTimerId = typeof window !== 'undefined' ? localStorage.getItem('activeTimerId') : null;
  const effectiveActiveId = activeTimerId || savedActiveTimerId || customTimers[0]?.id;
  const activeTimer = sortedTimers.find(timer => timer.id === effectiveActiveId) || sortedTimers[0]

  return (
    <div className="space-y-0">
      {/* タブヘッダー */}
      <div className="flex items-center justify-between">
        <Tabs 
          tabs={tabs} 
          activeTab={effectiveActiveId || ''} 
          onTabChange={(tabId) => setActiveTimerId(tabId)}
          onReorder={handleReorder}
          onEditTab={(tabId) => {
            const timer = sortedTimers.find(t => t.id === tabId);
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
                  // 削除されるタイマーのlocalStorageをクリア
                  localStorage.removeItem(`timer_${tabId}`);
                  
                  // 削除されたタイマーがアクティブタイマーだった場合、別のタイマーをアクティブに設定
                  if (activeTimerId === tabId) {
                    const remainingTimers = sortedTimers.filter(t => t.id !== tabId);
                    const newActiveTimerId = remainingTimers.length > 0 ? remainingTimers[0].id : null;
                    setActiveTimerId(newActiveTimerId);
                    if (newActiveTimerId) {
                      localStorage.setItem('activeTimerId', newActiveTimerId);
                    } else {
                      localStorage.removeItem('activeTimerId');
                    }
                  }
                  
                  // 親コンポーネントに削除を通知
                  onDeleteTimer?.(tabId);
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
          {/* すべてのタイマーをレンダリングして状態を保持 */}
          {sortedTimers.map((timer) => (
            <div
              key={timer.id}
              className={activeTimer.id === timer.id ? 'block' : 'hidden'}
            >
              <CustomTimer 
                ref={activeTimer.id === timer.id ? customTimerRef : null}
                timer={timer}
                isActive={activeTimer.id === timer.id}
                onComplete={handleCustomTimerComplete}
                onReset={() => {
                  // リセット機能はCustomTimer内で処理される
                }}
              />
            </div>
          ))}
          
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