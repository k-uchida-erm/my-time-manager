'use client'
import React, { useState, useEffect, useRef, useCallback, useImperativeHandle, forwardRef } from 'react';
import { Card, Button, IconButton } from '../atoms/ui';
import { PlayButton, RecordButton } from '../atoms/timer';
import { saveTimerEvent } from '@/app/actions';
import { sendTimerCompletionNotification, sendNotification } from '@/lib/utils/notifications';
import { CustomTimer as CustomTimerType } from './TimerCreationModal';

interface CustomTimerProps {
  timer: CustomTimerType;
  onComplete?: (duration: number) => void;
  onReset?: () => void;
  isActive?: boolean;
}

export type CustomTimerHandle = {
  handleReset: () => void;
};

export const CustomTimer = forwardRef<CustomTimerHandle, CustomTimerProps>(function CustomTimer({ timer, onComplete, onReset, isActive = true }: CustomTimerProps, ref) {
  // タイマーの種類ごとに基準値を保持
  const getInitialTime = () => {
    if (timer.type === 'countdown') {
      return (timer.duration || 25) * 60;
    } else if (timer.type === 'pomodoro') {
      return (timer.workDuration || 25) * 60;
    } else {
      return 0; // stopwatch
    }
  };

  const [isRunning, setIsRunning] = useState(false);
  const [note, setNote] = useState('');
  const [pomodoroPhase, setPomodoroPhase] = useState<'work' | 'break'>('work');
  const [completedPomodoros, setCompletedPomodoros] = useState(0);
  const [displayTime, setDisplayTime] = useState(getInitialTime());
  const [isStateRestored, setIsStateRestored] = useState(false);

  // 時刻管理
  const startTimeRef = useRef<number | null>(null);
  const pausedElapsedRef = useRef<number>(0);
  const durationRef = useRef<number>(getInitialTime());
  const breakDurationRef = useRef<number>(timer.breakDuration ? timer.breakDuration * 60 : 5 * 60);
  const workDurationRef = useRef<number>(timer.workDuration ? timer.workDuration * 60 : 25 * 60);
  const lastUpdateTimeRef = useRef<number>(Date.now());
  const animationFrameRef = useRef<number | null>(null);
  const prevTimerConfig = useRef<{type: string, workDuration?: number, breakDuration?: number, duration?: number} | null>(null);

  // ローカルストレージからタイマー状態を復元
  useEffect(() => {
    const savedState = localStorage.getItem(`timer_${timer.id}`);
    
    if (savedState) {
      try {
        const state = JSON.parse(savedState);
        const now = Date.now();
        
        // 設定が大幅に異なる場合は古い状態をクリア
        const stateConfig = {
          type: state.timerType || state.type || timer.type,
          duration: state.duration,
          workDuration: state.workDuration,
          breakDuration: state.breakDuration
        };
        
        const currentConfig = {
          type: timer.type,
          duration: timer.type === 'countdown' ? (timer.duration || 25) * 60 : undefined,
          workDuration: timer.type === 'pomodoro' ? (timer.workDuration || 25) * 60 : undefined,
          breakDuration: timer.type === 'pomodoro' ? (timer.breakDuration || 5) * 60 : undefined
        };
        
        // タイマータイプが一致しない場合のみクリア（より緩い条件）
        const typeMatches = stateConfig.type === currentConfig.type;
        
        if (!typeMatches) {
          localStorage.removeItem(`timer_${timer.id}`);
          setIsStateRestored(true); // 復元処理完了フラグを設定（初期状態で開始）
          return; // 復元処理をスキップして初期状態から開始
        }
        
        if (state.startTime) {
          const elapsed = Math.floor((now - state.startTime) / 1000) + (state.pausedElapsed || 0);
          
          if (timer.type === 'countdown') {
            const remaining = Math.max(state.duration - elapsed, 0);
            if (remaining > 0) {
              setDisplayTime(remaining);
              setIsRunning(state.isRunning); // 保存された実行状態を復元
              startTimeRef.current = state.startTime;
              pausedElapsedRef.current = state.pausedElapsed || 0;
              durationRef.current = state.duration;
              setIsStateRestored(true); // 復元成功フラグを設定
            } else {
              // スリープ中に完了した場合、実際の完了時間で記録
              startTimeRef.current = state.startTime;
              pausedElapsedRef.current = state.pausedElapsed || 0;
              durationRef.current = state.duration;
              setDisplayTime(0);
              setIsRunning(false);
              
              // 完了処理を実行（正確な時間で記録される）
              setTimeout(() => handleComplete(), 100); // 少し遅延して状態が確定してから実行
              setIsStateRestored(true); // 復元処理完了フラグを設定
            }
          } else if (timer.type === 'stopwatch') {
            setDisplayTime(elapsed);
            setIsRunning(state.isRunning); // 保存された実行状態を復元
            startTimeRef.current = state.startTime;
            pausedElapsedRef.current = state.pausedElapsed || 0;
            setIsStateRestored(true); // 復元成功フラグを設定
          } else if (timer.type === 'pomodoro') {
            const phaseDuration = state.pomodoroPhase === 'work' ? state.workDuration : state.breakDuration;
            const remaining = Math.max(phaseDuration - elapsed, 0);
            if (remaining > 0) {
              setDisplayTime(remaining);
              setIsRunning(state.isRunning); // 保存された実行状態を復元
              setPomodoroPhase(state.pomodoroPhase);
              setCompletedPomodoros(state.completedPomodoros || 0);
              startTimeRef.current = state.startTime;
              pausedElapsedRef.current = state.pausedElapsed || 0;
              durationRef.current = phaseDuration;
              workDurationRef.current = state.workDuration;
              breakDurationRef.current = state.breakDuration;
              setIsStateRestored(true); // 復元成功フラグを設定
            } else {
              // スリープ中にポモドーロフェーズが完了した場合の処理
              if (state.pomodoroPhase === 'work') {
                // 作業時間の記録を作成
                const workStartTime = state.startTime;
                const actualCompletionTime = workStartTime + (state.workDuration * 1000);
                const workDuration = state.workDuration; // 秒単位
                
                // タイムエントリを自動作成
                if (onComplete) {
                  onComplete(workDuration);
                }
                
                // 休憩フェーズに移行（ただし休憩時間も過ぎている可能性があるので停止）
                setPomodoroPhase('break');
                setCompletedPomodoros(prev => prev + 1);
                setDisplayTime(0);
                setIsRunning(false);
                
                saveEvent('complete', '作業時間完了');
                
              } else {
                setDisplayTime(0);
                setIsRunning(false);
                saveEvent('complete', '休憩時間完了');
              }
              setIsStateRestored(true); // 復元処理完了フラグを設定
            }
          }
        } else {
          setIsStateRestored(true); // 復元処理完了フラグを設定
        }
      } catch (error) {
        console.error(`[Timer ${timer.id}] Error restoring timer state:`, error);
        localStorage.removeItem(`timer_${timer.id}`);
        setIsStateRestored(true); // エラー時も復元処理完了フラグを設定
      }
    } else {
      setIsStateRestored(true); // 保存状態なしの場合も復元処理完了フラグを設定
    }

    // 復元処理完了後に現在の設定を記録（リセットを防ぐため）
    const currentConfig = {
      type: timer.type,
      duration: timer.duration,
      workDuration: timer.workDuration,
      breakDuration: timer.breakDuration
    };
    prevTimerConfig.current = currentConfig;
  }, [timer.id, timer.type]);

  // タイマー設定の初期化
  useEffect(() => {
    // 復元が成功している場合は初期化をスキップ
    if (isStateRestored) {
      return;
    }
    
    // 明示的に停止状態から開始
    setIsRunning(false);
    startTimeRef.current = null;
    pausedElapsedRef.current = 0;
    
    if (timer.type === 'countdown') {
      durationRef.current = (timer.duration || 25) * 60;
      setDisplayTime(durationRef.current);
    } else if (timer.type === 'pomodoro') {
      workDurationRef.current = (timer.workDuration || 25) * 60;
      breakDurationRef.current = (timer.breakDuration ? timer.breakDuration * 60 : 5 * 60);
      durationRef.current = workDurationRef.current;
      setDisplayTime(workDurationRef.current);
      setPomodoroPhase('work');
      setCompletedPomodoros(0);
    } else {
      setDisplayTime(0);
    }
  }, [timer.id, timer.type, isStateRestored]);

  // タイマー状態をローカルストレージに保存
  const saveTimerState = useCallback(() => {
    if (startTimeRef.current) {
      const state = {
        isRunning,
        startTime: startTimeRef.current,
        pausedElapsed: pausedElapsedRef.current,
        duration: durationRef.current,
        workDuration: workDurationRef.current,
        breakDuration: breakDurationRef.current,
        pomodoroPhase,
        completedPomodoros,
        type: timer.type, // タイマータイプを保存
        lastUpdate: Date.now()
      };
      localStorage.setItem(`timer_${timer.id}`, JSON.stringify(state));
    }
  }, [isRunning, pomodoroPhase, completedPomodoros, timer.id, timer.type]);

  // タイマー状態を保存（状態変更時）
  useEffect(() => {
    saveTimerState();
  }, [isRunning, pomodoroPhase, completedPomodoros, saveTimerState]);

  // タイマー完了処理
  const handleComplete = useCallback(() => {
    setIsRunning(false);
    
    const duration = timer.type === 'countdown' 
      ? durationRef.current 
      : Math.floor((Date.now() - (startTimeRef.current || 0)) / 1000) + pausedElapsedRef.current;
    
    let note = '';
    
    // 通知
    if (timer.enableNotifications) {
      sendNotification({
        title: 'タイマー完了！',
        message: `${timer.title}が終了しました。`
      });
    }
    
    saveEvent('complete', note || timer.title);
    onComplete?.(duration);
    handleReset();
  }, [timer.type, timer.title, timer.enableNotifications, onComplete]);

  // アニメーションループ
  useEffect(() => {
    if (!isRunning || !isActive) {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      return;
    }

    const updateTimer = () => {
      if (!startTimeRef.current || !isActive) {
        animationFrameRef.current = null;
        return;
      }

      const now = Date.now();
      const elapsed = Math.floor((now - startTimeRef.current) / 1000) + pausedElapsedRef.current;
      
      if (timer.type === 'countdown') {
        const remaining = Math.max(durationRef.current - elapsed, 0);
        setDisplayTime(remaining);
        
        if (remaining === 0) {
          handleComplete();
          return;
        }
      } else if (timer.type === 'pomodoro') {
        if (pomodoroPhase === 'work') {
          const remaining = Math.max(workDurationRef.current - elapsed, 0);
          setDisplayTime(remaining);
          
          if (remaining === 0) {
            // ポモドーロ完了 - 作業時間の記録を自動作成
            const workStartTime = startTimeRef.current;
            const workEndTime = now;
            const workDuration = Math.floor((workEndTime - workStartTime) / 1000);
            
            // タイムエントリを自動作成
            if (onComplete) {
              onComplete(workDuration);
            }
            
            setPomodoroPhase('break');
            setCompletedPomodoros(prev => prev + 1);
            pausedElapsedRef.current = 0;
            startTimeRef.current = now;
            durationRef.current = breakDurationRef.current;
            saveEvent('complete', '作業時間完了');
            
            // 通知
            if (timer.enableNotifications) {
              sendNotification({
                title: 'ポモドーロ完了！',
                message: '休憩時間を開始しましょう。'
              });
            }
          }
        } else {
          const remaining = Math.max(breakDurationRef.current - elapsed, 0);
          setDisplayTime(remaining);
          
          if (remaining === 0) {
            // 休憩完了
            setPomodoroPhase('work');
            pausedElapsedRef.current = 0;
            startTimeRef.current = now;
            durationRef.current = workDurationRef.current;
            saveEvent('complete', '休憩時間完了');
            
            // 通知
            if (timer.enableNotifications) {
              sendNotification({
                title: '休憩完了！',
                message: '作業を再開しましょう。'
              });
            }
          }
        }
      } else {
        setDisplayTime(elapsed);
      }
      
      lastUpdateTimeRef.current = now;
      
      // 状態保存（アクティブな場合のみ）
      if (isActive) {
        saveTimerState();
      }
      
      // 次のフレームをスケジュール
      animationFrameRef.current = requestAnimationFrame(updateTimer);
    };

    animationFrameRef.current = requestAnimationFrame(updateTimer);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    };
  }, [isRunning, timer.type, pomodoroPhase, timer.enableNotifications, isActive, handleComplete, saveTimerState]);

  // タイマー開始/停止の制御
  useEffect(() => {
    if (isRunning) {
      // animationFrameRef.current = requestAnimationFrame(updateTimer); // この行はアニメーションループ内で管理
    } else if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isRunning]);

  // ページの可視性変更を監視
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && isRunning && startTimeRef.current) {
        // ページが再表示された時、タイマー表示を更新
        const now = Date.now();
        const elapsed = Math.floor((now - startTimeRef.current) / 1000) + pausedElapsedRef.current;
        
        if (timer.type === 'countdown') {
          const remaining = Math.max(durationRef.current - elapsed, 0);
          setDisplayTime(remaining);
        } else if (timer.type === 'stopwatch') {
          setDisplayTime(elapsed);
        } else if (timer.type === 'pomodoro') {
          const phaseDuration = pomodoroPhase === 'work' ? workDurationRef.current : breakDurationRef.current;
          const remaining = Math.max(phaseDuration - elapsed, 0);
          setDisplayTime(remaining);
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [isRunning, timer.type, pomodoroPhase]);

  // タイマーイベントをサーバーに保存する関数
  const saveEvent = async (eventType: 'start' | 'pause' | 'resume' | 'complete' | 'reset' | 'pomodoro_complete' | 'break_complete', note?: string) => {
    try {
      const formData = new FormData();
      formData.append('timerId', timer.id);
      formData.append('eventType', eventType);
      formData.append('eventTime', Date.now().toString());
      formData.append('elapsedSeconds', displayTime.toString());
      if (note) {
        formData.append('note', note);
      }

      const result = await saveTimerEvent(formData);
      if (result?.error) {
        console.error('Failed to save timer event:', result.error);
      }
    } catch (error) {
      console.error('Error saving timer event:', error);
    }
  };

  const handleStart = () => {
    if (startTimeRef.current === null) {
      startTimeRef.current = Date.now();
      saveEvent('start');
    } else {
      startTimeRef.current = Date.now();
      saveEvent('resume');
    }
    setIsRunning(true);
  };

  const handleStop = () => {
    setIsRunning(false);
    if (startTimeRef.current !== null) {
      const now = Date.now();
      const elapsed = Math.floor((now - startTimeRef.current) / 1000);
      pausedElapsedRef.current += elapsed;
      startTimeRef.current = null;
      saveEvent('pause');
    }
  };

  const handleReset = () => {
    setIsRunning(false);
    setPomodoroPhase('work');
    setCompletedPomodoros(0);
    pausedElapsedRef.current = 0;
    if (timer.type === 'countdown') {
      durationRef.current = (timer.duration || 25) * 60;
      setDisplayTime(durationRef.current);
    } else if (timer.type === 'stopwatch') {
      setDisplayTime(0);
    } else if (timer.type === 'pomodoro') {
      workDurationRef.current = (timer.workDuration || 25) * 60;
      breakDurationRef.current = (timer.breakDuration ? timer.breakDuration * 60 : 5 * 60);
      durationRef.current = workDurationRef.current;
      setDisplayTime(workDurationRef.current);
    }
    startTimeRef.current = null;
    localStorage.removeItem(`timer_${timer.id}`);
    saveEvent('reset');
    onReset?.();
  };

  useImperativeHandle(ref, () => ({ handleReset }));

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getPhaseLabel = () => {
    if (timer.type === 'pomodoro') {
      return pomodoroPhase === 'work' ? '作業中' : '休憩中';
    }
    return timer.title;
  };

  return (
    <>
      {/* タイマー情報 */}
      <div className="text-center">
        {/* フェーズラベル */}
        <div className="text-sm text-muted-foreground mb-4">
          {getPhaseLabel()}
        </div>
        {/* 時間表示 - シンプルなデザイン */}
        <div className="mb-12 mt-8">
          <div className="text-8xl font-mono font-bold text-foreground tracking-wider">
            {formatTime(displayTime)}
          </div>
        </div>
        {/* ポモドーロ用の完了数表示 */}
        {timer.type === 'pomodoro' && (
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-600 rounded-full text-sm font-medium mb-4">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" clipRule="evenodd" />
            </svg>
            完了ポモドーロ: {completedPomodoros}個
          </div>
        )}
        {/* メインコントロールボタン */}
        <div className="flex justify-center items-center gap-4">
          <PlayButton
            isRunning={isRunning}
            onStart={handleStart}
            onStop={handleStop}
          />
          <RecordButton
            onClick={handleComplete}
            disabled={
              (timer.type === 'countdown' && !isRunning && displayTime === (timer.duration || 25) * 60) ||
              (timer.type === 'stopwatch' && !isRunning && displayTime === 0) ||
              (timer.type === 'pomodoro' && !isRunning && displayTime === (timer.workDuration || 25) * 60)
            }
          />
        </div>
      </div>
    </>
  );
}); 