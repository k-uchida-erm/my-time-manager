import { useCallback } from 'react'
import type { CustomTimer as CustomTimerType } from '@/components/molecules/TimerCreationModal'
import { sendNotification } from '@/lib/utils/notifications'

interface UseTimerControlsParams {
  timer: CustomTimerType
  // state setters
  setIsRunning: (v: boolean) => void
  setPomodoroPhase: (p: 'work' | 'break') => void
  setCompletedPomodoros: (updater: (prev: number) => number) => void
  setDisplayTime: (sec: number) => void
  onReset?: () => void
  onComplete?: (payload: { durationSeconds: number; startTimeMs: number; endTimeMs: number }) => void
  // refs
  startTimeRef: React.MutableRefObject<number | null>
  pausedElapsedRef: React.MutableRefObject<number>
  durationRef: React.MutableRefObject<number>
  workDurationRef: React.MutableRefObject<number>
  breakDurationRef: React.MutableRefObject<number>
  // persistence
  clearState: () => void
  // events
  saveEvent: (eventType: 'start' | 'pause' | 'resume' | 'complete' | 'reset' | 'pomodoro_complete' | 'break_complete', note?: string) => void | Promise<void>
}

export function useTimerControls(params: UseTimerControlsParams) {
  const {
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
  } = params

  const handleComplete = useCallback(() => {
    setIsRunning(false)

    const nowMs = Date.now()
    let duration = 0
    let startMs = nowMs
    if (timer.type === 'countdown') {
      duration = durationRef.current
      startMs = nowMs - duration * 1000
    } else {
      const elapsed = Math.floor((nowMs - (startTimeRef.current || 0)) / 1000) + pausedElapsedRef.current
      duration = elapsed
      startMs = (startTimeRef.current || nowMs) - pausedElapsedRef.current * 1000
    }

    if (timer.enableNotifications) {
      sendNotification({ title: 'タイマー完了！', message: `${timer.title}が終了しました。` })
    }

    saveEvent('complete', timer.title)
    onComplete?.({ durationSeconds: duration, startTimeMs: startMs, endTimeMs: nowMs })
    // reset
    setPomodoroPhase('work')
    setCompletedPomodoros(() => 0)
    pausedElapsedRef.current = 0
    if (timer.type === 'countdown') {
      durationRef.current = (timer.duration || 25) * 60
      setDisplayTime(durationRef.current)
    } else if (timer.type === 'stopwatch') {
      setDisplayTime(0)
    } else {
      workDurationRef.current = (timer.workDuration || 25) * 60
      breakDurationRef.current = (timer.breakDuration ? timer.breakDuration * 60 : 5 * 60)
      durationRef.current = workDurationRef.current
      setDisplayTime(workDurationRef.current)
    }
    startTimeRef.current = null
    clearState()
    saveEvent('reset')
    onReset?.()
  }, [timer, setIsRunning, setPomodoroPhase, setCompletedPomodoros, setDisplayTime, onReset, onComplete, startTimeRef, pausedElapsedRef, durationRef, workDurationRef, breakDurationRef, clearState, saveEvent])

  const handleStart = useCallback(() => {
    if (startTimeRef.current === null) {
      startTimeRef.current = Date.now()
      saveEvent('start')
    } else {
      startTimeRef.current = Date.now()
      saveEvent('resume')
    }
    setIsRunning(true)
  }, [saveEvent, setIsRunning, startTimeRef])

  const handleStop = useCallback(() => {
    setIsRunning(false)
    if (startTimeRef.current !== null) {
      const now = Date.now()
      const elapsed = Math.floor((now - startTimeRef.current) / 1000)
      pausedElapsedRef.current += elapsed
      startTimeRef.current = null
      saveEvent('pause')
    }
  }, [setIsRunning, startTimeRef, pausedElapsedRef, saveEvent])

  const handleReset = useCallback(() => {
    setIsRunning(false)
    setPomodoroPhase('work')
    setCompletedPomodoros(() => 0)
    pausedElapsedRef.current = 0
    if (timer.type === 'countdown') {
      durationRef.current = (timer.duration || 25) * 60
      setDisplayTime(durationRef.current)
    } else if (timer.type === 'stopwatch') {
      setDisplayTime(0)
    } else {
      workDurationRef.current = (timer.workDuration || 25) * 60
      breakDurationRef.current = (timer.breakDuration ? timer.breakDuration * 60 : 5 * 60)
      durationRef.current = workDurationRef.current
      setDisplayTime(workDurationRef.current)
    }
    startTimeRef.current = null
    clearState()
    saveEvent('reset')
    onReset?.()
  }, [timer, setIsRunning, setPomodoroPhase, setCompletedPomodoros, setDisplayTime, startTimeRef, pausedElapsedRef, durationRef, workDurationRef, breakDurationRef, clearState, saveEvent, onReset])

  const handleRecordClick = useCallback((isRunning: boolean, displayTime: number) => {
    if (timer.type !== 'stopwatch') return
    if (!isRunning && displayTime === 0) return
    if (window.confirm('記録しますか？タイマーはリセットされます。')) {
      handleComplete()
    }
  }, [timer.type, handleComplete])

  return { handleStart, handleStop, handleReset, handleRecordClick, handleComplete }
} 