'use client'
import React, { useState, useEffect, useLayoutEffect, useRef, useCallback, useImperativeHandle, forwardRef } from 'react';
import { Card, Button, IconButton } from '../atoms/ui';
import { PlayButton, RecordButton } from '../atoms/timer';
import { saveTimerEvent } from '@/app/actions';
import { sendTimerCompletionNotification, sendNotification } from '@/lib/utils/notifications';
import { CustomTimer as CustomTimerType } from './TimerCreationModal';
import { useTimerEvents } from '@/hooks/timer/useTimerEvents';
import { useTimerPersistence } from '@/hooks/timer/useTimerPersistence';
import { useTimerEngine } from '@/hooks/timer/useTimerEngine';
import { useTimerRestore } from '@/hooks/timer/useTimerRestore';
import { useTimerControls } from '@/hooks/timer/useTimerControls';
import type { TimerType } from '@/lib/timerTypes';
import type { PersistedTimerState } from '@/lib/timerTypes';

interface CustomTimerProps {
  timer: CustomTimerType;
  onComplete?: (payload: { durationSeconds: number; startTimeMs: number; endTimeMs: number }) => void;
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

  const [isRunning, setIsRunning] = useState(() => {
    try {
      if (typeof window === 'undefined') return false;
      const raw = localStorage.getItem(`timer_${timer.id}`);
      if (!raw) return false;
      const s = JSON.parse(raw);
      return Boolean(s.isRunning);
    } catch {
      return false;
    }
  });
  const [note, setNote] = useState('');
  const [pomodoroPhase, setPomodoroPhase] = useState<'work' | 'break'>(() => {
    try {
      if (typeof window === 'undefined') return 'work';
      const raw = localStorage.getItem(`timer_${timer.id}`);
      if (!raw) return 'work';
      const s = JSON.parse(raw);
      return (s.pomodoroPhase === 'break' || s.pomodoroPhase === 'work') ? s.pomodoroPhase : 'work';
    } catch {
      return 'work';
    }
  });
  const [completedPomodoros, setCompletedPomodoros] = useState<number>(() => {
    try {
      if (typeof window === 'undefined') return 0;
      const raw = localStorage.getItem(`timer_${timer.id}`);
      if (!raw) return 0;
      const s = JSON.parse(raw);
      return typeof s.completedPomodoros === 'number' ? s.completedPomodoros : 0;
    } catch {
      return 0;
    }
  });
  const [displayTime, setDisplayTime] = useState<number>(() => {
    try {
      if (typeof window === 'undefined') return getInitialTime();
      const raw = localStorage.getItem(`timer_${timer.id}`);
      if (!raw) return getInitialTime();
      const s = JSON.parse(raw);
      const now = Date.now();
      const pausedElapsed = s.pausedElapsed || 0;

      if (s.startTime) {
        const elapsed = Math.floor((now - s.startTime) / 1000) + pausedElapsed;
        if (timer.type === 'countdown') {
          const duration = s.duration ?? ((timer.duration || 25) * 60);
          return Math.max(duration - elapsed, 0);
        } else if (timer.type === 'stopwatch') {
          return elapsed;
        } else {
          const work = s.workDuration ?? ((timer.workDuration || 25) * 60);
          const brk = s.breakDuration ?? ((timer.breakDuration ? timer.breakDuration * 60 : 5 * 60));
          const phaseDur = (s.pomodoroPhase === 'break') ? brk : work;
          return Math.max(phaseDur - elapsed, 0);
        }
      } else {
        // paused state
        if (timer.type === 'countdown') {
          const duration = s.duration ?? ((timer.duration || 25) * 60);
          return Math.max(duration - pausedElapsed, 0);
        } else if (timer.type === 'stopwatch') {
          return pausedElapsed;
        } else {
          const work = s.workDuration ?? ((timer.workDuration || 25) * 60);
          const brk = s.breakDuration ?? ((timer.breakDuration ? timer.breakDuration * 60 : 5 * 60));
          const phaseDur = (s.pomodoroPhase === 'break') ? brk : work;
          return Math.max(phaseDur - pausedElapsed, 0);
        }
      }
    } catch {
      return getInitialTime();
    }
  });
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
  const didInitRefsFromSaved = useRef(false);
  const isRunningRef = useRef<boolean>(isRunning);
  const onCompleteRef = useRef<typeof onComplete | undefined>(onComplete);
  const handleCompleteRef = useRef<(() => void) | null>(null);
  const enableNotificationsRef = useRef<boolean>(!!timer.enableNotifications);

  const { saveEvent } = useTimerEvents(timer.id, () => displayTime);
  const { loadState, saveState, clearState, setupBeforeUnload } = useTimerPersistence(timer.id);

  useEffect(() => {
    isRunningRef.current = isRunning;
  }, [isRunning]);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    enableNotificationsRef.current = !!timer.enableNotifications;
  }, [timer.enableNotifications, timer.id]);

  // 初回のみ、保存状態から内部refを初期化
  if (!didInitRefsFromSaved.current && typeof window !== 'undefined') {
    try {
      const raw = localStorage.getItem(`timer_${timer.id}`);
      if (raw) {
        const s = JSON.parse(raw);
        pausedElapsedRef.current = s.pausedElapsed || 0;
        if (timer.type === 'countdown') {
          durationRef.current = s.duration ?? ((timer.duration || 25) * 60);
        } else if (timer.type === 'pomodoro') {
          workDurationRef.current = s.workDuration ?? ((timer.workDuration || 25) * 60);
          breakDurationRef.current = s.breakDuration ?? ((timer.breakDuration ? timer.breakDuration * 60 : 5 * 60));
          durationRef.current = (s.pomodoroPhase === 'break') ? breakDurationRef.current : workDurationRef.current;
        }
        startTimeRef.current = s.isRunning ? (s.startTime || null) : null;
      }
    } catch {}
    didInitRefsFromSaved.current = true;
  }

  useTimerRestore({
    timerId: timer.id,
    timerType: timer.type as TimerType,
    durationSec: timer.type === 'countdown' ? (timer.duration || 25) * 60 : undefined,
    workDurationSec: timer.type === 'pomodoro' ? (timer.workDuration || 25) * 60 : undefined,
    breakDurationSec: timer.type === 'pomodoro' ? (timer.breakDuration ? timer.breakDuration * 60 : 5 * 60) : undefined,
    setDisplayTime,
    setIsRunning,
    setPomodoroPhase,
    setCompletedPomodoros,
    startTimeRef,
    pausedElapsedRef,
    durationRef,
    workDurationRef,
    breakDurationRef,
    loadState,
    clearState,
    onRestored: () => setIsStateRestored(true),
  });

  // タイマー設定の初期化
  useEffect(() => {
    // 既に保存済みの状態がある場合は初期化しない（リロード時にリセットされるのを防ぐ）
    try {
      const saved = localStorage.getItem(`timer_${timer.id}`);
      if (saved) {
        return;
      }
    } catch {}

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
    
    // 新規タイマー作成時のみlocalStorageをクリア（リロード時は保持）
    // この処理は新規作成時のみ実行されるべき
  }, [timer.id, timer.type, timer.duration, timer.workDuration, timer.breakDuration]);

  // タイマー状態をローカルストレージに保存
  const saveTimerState = useCallback(() => {
    const state: PersistedTimerState = {
      isRunning: isRunningRef.current,
      startTime: startTimeRef.current,
      pausedElapsed: pausedElapsedRef.current,
      duration: durationRef.current,
      workDuration: workDurationRef.current,
      breakDuration: breakDurationRef.current,
      pomodoroPhase,
      completedPomodoros,
      type: timer.type,
      lastUpdate: Date.now()
    };
    saveState(state);
  }, [pomodoroPhase, completedPomodoros, timer.type, saveState]);

  const saveTimerStateWithOverride = useCallback((overrides?: { isRunning?: boolean; startTime?: number | null }) => {
    const state = {
      isRunning: overrides?.isRunning ?? isRunningRef.current,
      startTime: overrides?.startTime !== undefined ? overrides.startTime : startTimeRef.current,
      pausedElapsed: pausedElapsedRef.current,
      duration: durationRef.current,
      workDuration: workDurationRef.current,
      breakDuration: breakDurationRef.current,
      pomodoroPhase,
      completedPomodoros,
      type: timer.type,
      lastUpdate: Date.now()
    };
    localStorage.setItem(`timer_${timer.id}`, JSON.stringify(state));
  }, [pomodoroPhase, completedPomodoros, timer.id, timer.type]);

  // タイマー状態を保存（状態変更時）
  useEffect(() => {
    // 復元処理が完了していない場合は保存しない
    if (!isStateRestored) {
      return;
    }
    saveTimerState();
  }, [isRunning, pomodoroPhase, completedPomodoros, saveTimerState, isStateRestored]);

  // ページ離脱時に状態を保存
  useEffect(() => setupBeforeUnload(() => ({
    isRunning: isRunningRef.current,
    startTime: startTimeRef.current,
    pausedElapsed: pausedElapsedRef.current,
    duration: durationRef.current,
    workDuration: workDurationRef.current,
    breakDuration: breakDurationRef.current,
    pomodoroPhase,
    completedPomodoros,
    type: timer.type,
    lastUpdate: Date.now()
  })), [setupBeforeUnload, pomodoroPhase, completedPomodoros, timer.type]);

  // タイマー完了処理
  // Define controls before handleComplete to satisfy hook deps
  const { handleStart, handleStop, handleReset, handleRecordClick } = useTimerControls({
    timer,
    setIsRunning,
    setPomodoroPhase,
    setCompletedPomodoros,
    setDisplayTime,
    onReset,
    onComplete,
    startTimeRef,
    pausedElapsedRef,
    durationRef,
    workDurationRef,
    breakDurationRef,
    clearState,
    saveEvent,
  });

  const handleComplete = useCallback(() => {
    setIsRunning(false);
    
    const nowMs = Date.now();
    let duration = 0;
    let startMs = nowMs;
    if (timer.type === 'countdown') {
      duration = durationRef.current;
      startMs = nowMs - duration * 1000;
    } else {
      const elapsed = Math.floor((nowMs - (startTimeRef.current || 0)) / 1000) + pausedElapsedRef.current;
      duration = elapsed;
      startMs = (startTimeRef.current || nowMs) - pausedElapsedRef.current * 1000;
    }
    
    const note = '';
    
    // 通知
    if (timer.enableNotifications) {
      sendNotification({
        title: 'タイマー完了！',
        message: `${timer.title}が終了しました。`
      });
    }
    
    saveEvent('complete', note || timer.title);
    onComplete?.({ durationSeconds: duration, startTimeMs: startMs, endTimeMs: nowMs });
    handleReset();
  }, [timer.type, timer.title, timer.enableNotifications, onComplete, handleReset, saveEvent]);

  useEffect(() => {
    handleCompleteRef.current = handleComplete;
  }, [handleComplete]);

  useTimerEngine({
    isRunning,
    isActive,
    timerType: timer.type as TimerType,
    pomodoroPhase,
    startTimeRef,
    pausedElapsedRef,
    durationRef,
    workDurationRef,
    breakDurationRef,
    lastUpdateTimeRef,
    animationFrameRef,
    setDisplayTime,
    setPomodoroPhase,
    setCompletedPomodoros,
    onCountdownZero: () => handleComplete(),
    onPomodoroWorkZero: (now) => {
      const workStartTime = startTimeRef.current;
      const workEndTime = now;
      const workDuration = Math.floor((workEndTime - (workStartTime || workEndTime)) / 1000);
      if (onComplete && workStartTime) {
        onComplete({ durationSeconds: workDuration, startTimeMs: workStartTime, endTimeMs: workEndTime });
      }
      setPomodoroPhase('break');
      setCompletedPomodoros(prev => prev + 1);
      pausedElapsedRef.current = 0;
      startTimeRef.current = now;
      durationRef.current = breakDurationRef.current;
      saveEvent('complete', '作業時間完了');
      if (timer.enableNotifications) {
        sendNotification({ title: 'ポモドーロ完了！', message: '休憩時間を開始しましょう。' });
      }
    },
    onPomodoroBreakZero: (now) => {
      setPomodoroPhase('work');
      pausedElapsedRef.current = 0;
      startTimeRef.current = now;
      durationRef.current = workDurationRef.current;
      saveEvent('complete', '休憩時間完了');
      if (timer.enableNotifications) {
        sendNotification({ title: '休憩完了！', message: '作業を再開しましょう。' });
      }
    },
    shouldSaveState: isActive && isStateRestored,
    saveTimerState,
    onProlongedPause: (pauseStartedAt) => {
      const nowMs = Date.now();
      // Determine session start/end based on timer type and paused state
      let startMs: number;
      const endMs = nowMs;
      let durationSeconds = 0;

      if (timer.type === 'countdown') {
        // For countdown, record the actual elapsed during the session before pause
        // elapsed before pause = durationRef.current - remainingAtPause
        const elapsedBeforePause = pausedElapsedRef.current;
        durationSeconds = elapsedBeforePause;
        startMs = nowMs - durationSeconds * 1000;
      } else {
        // Stopwatch or pomodoro: elapsed is pausedElapsed accumulated
        durationSeconds = pausedElapsedRef.current;
        startMs = (startTimeRef.current ?? nowMs) - pausedElapsedRef.current * 1000;
      }

      // If nothing meaningful was elapsed, skip
      if (durationSeconds <= 0) {
        // Just reset
        handleReset();
        return;
      }

      // Save as completion and reset
      saveEvent('complete', '一時停止が10分継続したため自動記録');
      onComplete?.({ durationSeconds, startTimeMs: startMs, endTimeMs: endMs });
      handleReset();
    },
  });

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

  // ページの可視性変更を監視（handleComplete 定義後に設置）
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && startTimeRef.current) {
        const now = Date.now();
        const elapsed = Math.floor((now - startTimeRef.current) / 1000) + pausedElapsedRef.current;

        if (timer.type === 'countdown') {
          const remaining = Math.max(durationRef.current - elapsed, 0);
          setDisplayTime(remaining);
          if (isRunning && remaining === 0) {
            handleCompleteRef.current?.();
            return;
          }
        } else if (timer.type === 'stopwatch') {
          setDisplayTime(elapsed);
        } else if (timer.type === 'pomodoro') {
          const phaseDuration = pomodoroPhase === 'work' ? workDurationRef.current : breakDurationRef.current;
          const remaining = Math.max(phaseDuration - elapsed, 0);
          setDisplayTime(remaining);

          if (isRunning && remaining === 0) {
            if (pomodoroPhase === 'work') {
              // 作業完了時は自動記録
              const workStartTime = startTimeRef.current;
              const workEndTime = now;
              const workDuration = Math.floor((workEndTime - workStartTime) / 1000);

              if (onComplete) {
                onComplete({ durationSeconds: workDuration, startTimeMs: workStartTime, endTimeMs: workEndTime });
              }

              setPomodoroPhase('break');
              setCompletedPomodoros(prev => prev + 1);
              pausedElapsedRef.current = 0;
              startTimeRef.current = now;
              durationRef.current = breakDurationRef.current;
              saveEvent('complete', '作業時間完了');

              if (timer.enableNotifications) {
                sendNotification({
                  title: 'ポモドーロ完了！',
                  message: '休憩時間を開始しましょう。'
                });
              }
            } else {
              // 休憩完了
              setPomodoroPhase('work');
              pausedElapsedRef.current = 0;
              startTimeRef.current = now;
              durationRef.current = workDurationRef.current;
              saveEvent('complete', '休憩時間完了');

              if (timer.enableNotifications) {
                sendNotification({
                  title: '休憩完了！',
                  message: '作業を再開しましょう。'
                });
              }
            }
          }
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [isRunning, timer.type, pomodoroPhase, saveEvent]);

  // saveEvent は useTimerEvents から提供

  // 直後の保存は引き続きこのコンポーネント側で実施（挙動不変）
  const startWithSave = () => {
    handleStart();
    saveTimerStateWithOverride({ isRunning: true, startTime: startTimeRef.current });
  };
  const stopWithSave = () => {
    handleStop();
    saveTimerStateWithOverride({ isRunning: false, startTime: null });
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

  const isPaused = !isRunning && startTimeRef.current === null && pausedElapsedRef.current > 0;

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
            onStart={startWithSave}
            onStop={stopWithSave}
          />
          {timer.type === 'stopwatch' && (
            <RecordButton
              onClick={() => handleRecordClick(isRunning, displayTime)}
              disabled={!isRunning && displayTime === 0}
            />
          )}
        </div>
        {isPaused && (
          <div className="mt-4 inline-flex items-center gap-2 text-xs text-red-600">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v4m0 4h.01M10.29 3.86l-7.4 12.8A1 1 0 003.7 18h16.6a1 1 0 00.86-1.5l-7.4-12.8a1 1 0 00-1.72 0z" />
            </svg>
            <span>一時停止が10分間続くと自動的に記録してリセットされます</span>
          </div>
        )}
      </div>
    </>
  );
}); 