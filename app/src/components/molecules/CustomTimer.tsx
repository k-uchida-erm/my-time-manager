'use client'
import React, { useState, useEffect, useLayoutEffect, useRef, useCallback, useImperativeHandle, forwardRef } from 'react';
import { Card, Button, IconButton } from '../atoms/ui';
import { PlayButton, RecordButton } from '../atoms/timer';
import { saveTimerEvent } from '@/app/actions';
import { sendTimerCompletionNotification, sendNotification } from '@/lib/utils/notifications';
import { CustomTimer as CustomTimerType } from './TimerCreationModal';

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

  // ローカルストレージからタイマー状態を復元（描画前に適用）
  useLayoutEffect(() => {
    console.log(`[Timer ${timer.id}] Starting state restoration...`);
    const savedState = localStorage.getItem(`timer_${timer.id}`);
    
    if (savedState) {
      try {
        const state = JSON.parse(savedState);
        console.log(`[Timer ${timer.id}] Found saved state:`, state);
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
        
        console.log(`[Timer ${timer.id}] State config:`, stateConfig);
        console.log(`[Timer ${timer.id}] Current config:`, currentConfig);
        
        // タイマータイプが一致しない場合のみクリア
        const typeMatches = stateConfig.type === currentConfig.type;
        
        if (!typeMatches) {
          console.log(`[Timer ${timer.id}] Type mismatch, clearing state`);
          localStorage.removeItem(`timer_${timer.id}`);
          setIsStateRestored(true);
          return;
        }
        
        if (state.startTime) {
          const elapsed = Math.floor((now - state.startTime) / 1000) + (state.pausedElapsed || 0);
          console.log(`[Timer ${timer.id}] Elapsed time:`, elapsed);
          
          if (timer.type === 'countdown') {
            const remaining = Math.max(state.duration - elapsed, 0);
            console.log(`[Timer ${timer.id}] Countdown remaining:`, remaining);
            if (remaining > 0) {
              setDisplayTime(remaining);
              // 保存された実行状態を復元
              console.log(`[Timer ${timer.id}] Restoring running state:`, state.isRunning);
              setIsRunning(state.isRunning);
              if (state.isRunning) {
                startTimeRef.current = state.startTime;
                console.log(`[Timer ${timer.id}] Restored startTime:`, state.startTime);
              } else {
                startTimeRef.current = null;
                console.log(`[Timer ${timer.id}] Timer was paused, startTime cleared`);
              }
              pausedElapsedRef.current = state.pausedElapsed || 0;
              durationRef.current = state.duration;
              setIsStateRestored(true);
              console.log(`[Timer ${timer.id}] State restoration completed`);
            } else {
              // スリープ中に完了した場合、実際の完了時間で記録
              console.log(`[Timer ${timer.id}] Timer completed while away`);
              startTimeRef.current = state.startTime;
              pausedElapsedRef.current = state.pausedElapsed || 0;
              durationRef.current = state.duration;
              setDisplayTime(0);
              setIsRunning(false);
              
              // 完了処理を実行（正確な時間で記録される）
              setTimeout(() => handleComplete(), 100);
              setIsStateRestored(true);
            }
          } else if (timer.type === 'stopwatch') {
            setDisplayTime(elapsed);
            // 保存された実行状態を復元
            console.log(`[Timer ${timer.id}] Restoring stopwatch state:`, state.isRunning);
            setIsRunning(state.isRunning);
            if (state.isRunning) {
              startTimeRef.current = state.startTime;
              console.log(`[Timer ${timer.id}] Restored startTime:`, state.startTime);
            } else {
              startTimeRef.current = null;
              console.log(`[Timer ${timer.id}] Stopwatch was paused, startTime cleared`);
            }
            pausedElapsedRef.current = state.pausedElapsed || 0;
            setIsStateRestored(true);
            console.log(`[Timer ${timer.id}] State restoration completed`);
          } else if (timer.type === 'pomodoro') {
            const phaseDuration = state.pomodoroPhase === 'work' ? state.workDuration : state.breakDuration;
            const remaining = Math.max(phaseDuration - elapsed, 0);
            console.log(`[Timer ${timer.id}] Pomodoro remaining:`, remaining, 'phase:', state.pomodoroPhase);
            if (remaining > 0) {
              setDisplayTime(remaining);
              // 保存された実行状態を復元
              console.log(`[Timer ${timer.id}] Restoring pomodoro state:`, state.isRunning);
              setIsRunning(state.isRunning);
              setPomodoroPhase(state.pomodoroPhase);
              setCompletedPomodoros(state.completedPomodoros || 0);
              if (state.isRunning) {
                startTimeRef.current = state.startTime;
                console.log(`[Timer ${timer.id}] Restored startTime:`, state.startTime);
              } else {
                startTimeRef.current = null;
                console.log(`[Timer ${timer.id}] Pomodoro was paused, startTime cleared`);
              }
              pausedElapsedRef.current = state.pausedElapsed || 0;
              durationRef.current = phaseDuration;
              workDurationRef.current = state.workDuration;
              breakDurationRef.current = state.breakDuration;
              setIsStateRestored(true);
              console.log(`[Timer ${timer.id}] State restoration completed`);
            } else {
              // スリープ中にポモドーロフェーズが完了した場合の処理
              console.log(`[Timer ${timer.id}] Pomodoro phase completed while away`);
              if (state.pomodoroPhase === 'work') {
                // 作業時間の記録を作成
                const workStartTime = state.startTime;
                const actualCompletionTime = workStartTime + (state.workDuration * 1000);
                const workDuration = state.workDuration; // 秒単位
                
                // タイムエントリを自動作成
                if (onComplete) {
                  onComplete({ durationSeconds: workDuration, startTimeMs: workStartTime, endTimeMs: actualCompletionTime });
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
              setIsStateRestored(true);
            }
          }
        } else {
          console.log(`[Timer ${timer.id}] No startTime in saved state (paused state restore)`);
          const pausedElapsed = state.pausedElapsed || 0;
          if (timer.type === 'countdown') {
            const duration = state.duration ?? ((timer.duration || 25) * 60);
            durationRef.current = duration;
            pausedElapsedRef.current = pausedElapsed;
            setDisplayTime(Math.max(duration - pausedElapsed, 0));
            setIsRunning(false);
            startTimeRef.current = null;
          } else if (timer.type === 'stopwatch') {
            pausedElapsedRef.current = pausedElapsed;
            setDisplayTime(pausedElapsed);
            setIsRunning(false);
            startTimeRef.current = null;
          } else if (timer.type === 'pomodoro') {
            const workDuration = state.workDuration ?? ((timer.workDuration || 25) * 60);
            const breakDuration = state.breakDuration ?? ((timer.breakDuration ? timer.breakDuration * 60 : 5 * 60));
            workDurationRef.current = workDuration;
            breakDurationRef.current = breakDuration;
            const phase = state.pomodoroPhase || 'work';
            setPomodoroPhase(phase);
            setCompletedPomodoros(state.completedPomodoros || 0);
            const phaseDur = phase === 'break' ? breakDuration : workDuration;
            durationRef.current = phaseDur;
            pausedElapsedRef.current = pausedElapsed;
            setDisplayTime(Math.max(phaseDur - pausedElapsed, 0));
            setIsRunning(false);
            startTimeRef.current = null;
          }
          setIsStateRestored(true);
        }
      } catch (error) {
        console.error(`[Timer ${timer.id}] Error restoring timer state:`, error);
        localStorage.removeItem(`timer_${timer.id}`);
        setIsStateRestored(true);
      }
    } else {
      console.log(`[Timer ${timer.id}] No saved state found`);
      setIsStateRestored(true);
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
  }, [timer.id, timer.type]);

  // タイマー状態をローカルストレージに保存
  const saveTimerState = useCallback(() => {
    const state = {
      isRunning: isRunningRef.current,
      startTime: startTimeRef.current, // 実行中でなければ null
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
  useEffect(() => {
    const onBeforeUnload = () => {
      try { saveTimerState(); } catch {}
    };
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, [saveTimerState]);

  // タイマー完了処理
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
  }, [timer.type, timer.title, timer.enableNotifications, onComplete]);

  // ストップウォッチ用の記録確認ハンドラ
  const handleRecordClick = () => {
    if (timer.type !== 'stopwatch') return;
    if (!isRunning && displayTime === 0) return;
    if (window.confirm('記録しますか？タイマーはリセットされます。')) {
      handleComplete();
    }
  };

  useEffect(() => {
    handleCompleteRef.current = handleComplete;
  }, [handleComplete]);

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
            if (onComplete && workStartTime) {
              onComplete({ durationSeconds: workDuration, startTimeMs: workStartTime, endTimeMs: workEndTime });
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
      if (isActive && isStateRestored) {
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

              if (workStartTime) {
                onCompleteRef.current?.({ durationSeconds: workDuration, startTimeMs: workStartTime, endTimeMs: workEndTime });
              }

              setPomodoroPhase('break');
              setCompletedPomodoros(prev => prev + 1);
              pausedElapsedRef.current = 0;
              startTimeRef.current = now;
              durationRef.current = breakDurationRef.current;
              saveEvent('complete', '作業時間完了');

              if (enableNotificationsRef.current) {
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

              if (enableNotificationsRef.current) {
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
    // すぐに保存して、開始直後のリロードでも復元できるようにする
    saveTimerStateWithOverride({ isRunning: true, startTime: startTimeRef.current });
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
    // 一時停止状態を保存
    saveTimerStateWithOverride({ isRunning: false, startTime: null });
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
          {timer.type === 'stopwatch' && (
            <RecordButton
              onClick={handleRecordClick}
              disabled={!isRunning && displayTime === 0}
            />
          )}
        </div>
      </div>
    </>
  );
}); 