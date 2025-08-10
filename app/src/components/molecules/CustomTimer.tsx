'use client'
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Card, Button, IconButton } from '../atoms/ui';
import { PlayButton, RecordButton } from '../atoms/timer';
import { saveTimerEvent } from '@/app/actions';
import { sendTimerCompletionNotification } from '@/lib/utils/notifications';
import { CustomTimer as CustomTimerType } from './TimerCreationModal';

interface CustomTimerProps {
  timer: CustomTimerType;
  onComplete: (duration: number) => void;
  onReset?: () => void;
}

export function CustomTimer({ timer, onComplete, onReset }: CustomTimerProps) {
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

  // 時刻管理
  const startTimeRef = useRef<number | null>(null);
  const pausedElapsedRef = useRef<number>(0);
  const durationRef = useRef<number>(getInitialTime());
  const breakDurationRef = useRef<number>(timer.breakDuration ? timer.breakDuration * 60 : 5 * 60);
  const workDurationRef = useRef<number>(timer.workDuration ? timer.workDuration * 60 : 25 * 60);
  const lastUpdateTimeRef = useRef<number>(Date.now());
  const animationFrameRef = useRef<number | null>(null);

  // ローカルストレージからタイマー状態を復元
  useEffect(() => {
    const savedState = localStorage.getItem(`timer_${timer.id}`);
    if (savedState) {
      try {
        const state = JSON.parse(savedState);
        const now = Date.now();
        
        if (state.isRunning && state.startTime) {
          const elapsed = Math.floor((now - state.startTime) / 1000) + (state.pausedElapsed || 0);
          
          if (timer.type === 'countdown') {
            const remaining = Math.max(state.duration - elapsed, 0);
            if (remaining > 0) {
              setDisplayTime(remaining);
              setIsRunning(true);
              startTimeRef.current = state.startTime;
              pausedElapsedRef.current = state.pausedElapsed || 0;
              durationRef.current = state.duration;
            }
          } else if (timer.type === 'stopwatch') {
            setDisplayTime(elapsed);
            setIsRunning(true);
            startTimeRef.current = state.startTime;
            pausedElapsedRef.current = state.pausedElapsed || 0;
          } else if (timer.type === 'pomodoro') {
            const phaseDuration = state.pomodoroPhase === 'work' ? state.workDuration : state.breakDuration;
            const remaining = Math.max(phaseDuration - elapsed, 0);
            if (remaining > 0) {
              setDisplayTime(remaining);
              setIsRunning(true);
              setPomodoroPhase(state.pomodoroPhase);
              setCompletedPomodoros(state.completedPomodoros || 0);
              startTimeRef.current = state.startTime;
              pausedElapsedRef.current = state.pausedElapsed || 0;
              durationRef.current = phaseDuration;
              workDurationRef.current = state.workDuration;
              breakDurationRef.current = state.breakDuration;
            }
          }
        }
      } catch (error) {
        console.error('Error restoring timer state:', error);
        localStorage.removeItem(`timer_${timer.id}`);
      }
    }
  }, [timer.id, timer.type]);

  // 設定変更時に初期化
  useEffect(() => {
    setIsRunning(false);
    setPomodoroPhase('work');
    setCompletedPomodoros(0);
    pausedElapsedRef.current = 0;
    if (timer.type === 'countdown') {
      durationRef.current = (timer.duration || 25) * 60;
      setDisplayTime(durationRef.current);
    } else if (timer.type === 'pomodoro') {
      workDurationRef.current = (timer.workDuration || 25) * 60;
      breakDurationRef.current = (timer.breakDuration ? timer.breakDuration * 60 : 5 * 60);
      durationRef.current = workDurationRef.current;
      setDisplayTime(workDurationRef.current);
    } else {
      setDisplayTime(0);
    }
    startTimeRef.current = null;
    localStorage.removeItem(`timer_${timer.id}`);
  }, [timer.type, timer.duration, timer.workDuration, timer.breakDuration, timer.id]);

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
        lastUpdate: Date.now()
      };
      localStorage.setItem(`timer_${timer.id}`, JSON.stringify(state));
    }
  }, [isRunning, pomodoroPhase, completedPomodoros, timer.id]);

  // タイマー状態を保存（状態変更時）
  useEffect(() => {
    saveTimerState();
  }, [isRunning, pomodoroPhase, completedPomodoros, saveTimerState]);

  // メインのタイマー進行（requestAnimationFrame使用）
  const updateTimer = useCallback(() => {
    if (!isRunning || !startTimeRef.current) return;

    const now = Date.now();
    const elapsed = Math.floor((now - startTimeRef.current) / 1000) + pausedElapsedRef.current;
    
    if (timer.type === 'countdown') {
      const remaining = Math.max(durationRef.current - elapsed, 0);
      setDisplayTime(remaining);
      if (remaining === 0) {
        setIsRunning(false);
        handleComplete();
        return;
      }
    } else if (timer.type === 'stopwatch') {
      setDisplayTime(elapsed);
    } else if (timer.type === 'pomodoro') {
      if (pomodoroPhase === 'work') {
        const remaining = Math.max(workDurationRef.current - elapsed, 0);
        setDisplayTime(remaining);
        if (remaining === 0) {
          setPomodoroPhase('break');
          pausedElapsedRef.current = 0;
          startTimeRef.current = Date.now();
          durationRef.current = breakDurationRef.current;
          saveTimerState();
        }
      } else {
        const remaining = Math.max(breakDurationRef.current - elapsed, 0);
        setDisplayTime(remaining);
        if (remaining === 0) {
          setPomodoroPhase('work');
          setCompletedPomodoros(prev => prev + 1);
          pausedElapsedRef.current = 0;
          startTimeRef.current = Date.now();
          durationRef.current = workDurationRef.current;
          saveTimerState();
        }
      }
    }

    lastUpdateTimeRef.current = now;
    animationFrameRef.current = requestAnimationFrame(updateTimer);
  }, [isRunning, timer.type, pomodoroPhase, saveTimerState]);

  // タイマー開始/停止の制御
  useEffect(() => {
    if (isRunning) {
      animationFrameRef.current = requestAnimationFrame(updateTimer);
    } else if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isRunning, updateTimer]);

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
  const saveEvent = async (eventType: 'start' | 'pause' | 'resume' | 'complete' | 'reset', note?: string) => {
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

  const handleComplete = () => {
    let duration: number;
    if (timer.type === 'countdown') {
      duration = (timer.duration || 25) * 60 - displayTime;
    } else if (timer.type === 'stopwatch') {
      duration = displayTime;
    } else {
      duration = displayTime;
    }
    
    if (timer.enableNotifications) {
      sendTimerCompletionNotification(
        timer.title,
        'タイマーが完了しました',
        true
      );
    }
    
    saveEvent('complete', note || timer.title);
    onComplete(duration);
    handleReset();
  };

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
} 