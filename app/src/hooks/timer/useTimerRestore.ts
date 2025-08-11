import { useLayoutEffect } from 'react'
import type { PomodoroPhase, TimerType, PersistedTimerState } from '@/lib/timerTypes'

interface UseTimerRestoreParams {
  timerId: string
  timerType: TimerType
  durationSec?: number
  workDurationSec?: number
  breakDurationSec?: number
  // state setters/refs
  setDisplayTime: (sec: number) => void
  setIsRunning: (v: boolean) => void
  setPomodoroPhase: (p: PomodoroPhase) => void
  setCompletedPomodoros: (updater: (prev: number) => number) => void
  // refs
  startTimeRef: React.MutableRefObject<number | null>
  pausedElapsedRef: React.MutableRefObject<number>
  durationRef: React.MutableRefObject<number>
  workDurationRef: React.MutableRefObject<number>
  breakDurationRef: React.MutableRefObject<number>
  // persistence
  loadState: () => PersistedTimerState | null
  clearState: () => void
  // flags
  onRestored: () => void
}

export function useTimerRestore(params: UseTimerRestoreParams) {
  const {
    timerId,
    timerType,
    durationSec,
    workDurationSec,
    breakDurationSec,
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
    onRestored,
  } = params

  useLayoutEffect(() => {
    const state = loadState()
    const now = Date.now()
    if (!state) {
      onRestored()
      return
    }

    // タイプ不一致はクリア
    const persistedType: TimerType = (state as any).timerType || state.type || timerType
    if (persistedType !== timerType) {
      clearState()
      onRestored()
      return
    }

    if (state.startTime) {
      const elapsed = Math.floor((now - state.startTime) / 1000) + (state.pausedElapsed || 0)
      if (timerType === 'countdown') {
        const remaining = Math.max(state.duration - elapsed, 0)
        setDisplayTime(remaining)
        setIsRunning(!!state.isRunning)
        startTimeRef.current = state.isRunning ? state.startTime : null
        pausedElapsedRef.current = state.pausedElapsed || 0
        durationRef.current = state.duration
        onRestored()
      } else if (timerType === 'stopwatch') {
        setDisplayTime(elapsed)
        setIsRunning(!!state.isRunning)
        startTimeRef.current = state.isRunning ? state.startTime : null
        pausedElapsedRef.current = state.pausedElapsed || 0
        onRestored()
      } else {
        const phaseDur = state.pomodoroPhase === 'work' ? state.workDuration : state.breakDuration
        const remaining = Math.max(phaseDur - elapsed, 0)
        setDisplayTime(remaining)
        setIsRunning(!!state.isRunning)
        setPomodoroPhase(state.pomodoroPhase)
        setCompletedPomodoros(() => state.completedPomodoros || 0)
        startTimeRef.current = state.isRunning ? state.startTime : null
        pausedElapsedRef.current = state.pausedElapsed || 0
        durationRef.current = phaseDur
        workDurationRef.current = state.workDuration
        breakDurationRef.current = state.breakDuration
        onRestored()
      }
    } else {
      // paused only
      const pausedElapsed = state.pausedElapsed || 0
      if (timerType === 'countdown') {
        const duration = state.duration ?? (durationSec || 25 * 60)
        durationRef.current = duration
        pausedElapsedRef.current = pausedElapsed
        setDisplayTime(Math.max(duration - pausedElapsed, 0))
      } else if (timerType === 'stopwatch') {
        pausedElapsedRef.current = pausedElapsed
        setDisplayTime(pausedElapsed)
      } else {
        const work = state.workDuration ?? (workDurationSec || 25 * 60)
        const brk = state.breakDuration ?? (breakDurationSec || 5 * 60)
        workDurationRef.current = work
        breakDurationRef.current = brk
        const phase = state.pomodoroPhase || 'work'
        setPomodoroPhase(phase)
        setCompletedPomodoros(() => state.completedPomodoros || 0)
        const phaseDur = phase === 'break' ? brk : work
        durationRef.current = phaseDur
        pausedElapsedRef.current = pausedElapsed
        setDisplayTime(Math.max(phaseDur - pausedElapsed, 0))
      }
      setIsRunning(false)
      startTimeRef.current = null
      onRestored()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timerId, timerType])
} 