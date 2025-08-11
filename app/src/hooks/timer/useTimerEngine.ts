import { MutableRefObject, useEffect } from 'react'

export type TimerType = 'countdown' | 'stopwatch' | 'pomodoro'
export type PomodoroPhase = 'work' | 'break'

interface UseTimerEngineParams {
  // controls
  isRunning: boolean
  isActive: boolean
  timerType: TimerType
  pomodoroPhase: PomodoroPhase

  // refs
  startTimeRef: MutableRefObject<number | null>
  pausedElapsedRef: MutableRefObject<number>
  durationRef: MutableRefObject<number>
  workDurationRef: MutableRefObject<number>
  breakDurationRef: MutableRefObject<number>
  lastUpdateTimeRef?: MutableRefObject<number>
  animationFrameRef: MutableRefObject<number | null>

  // setters
  setDisplayTime: (seconds: number) => void
  setPomodoroPhase: (p: PomodoroPhase) => void
  setCompletedPomodoros: (updater: (prev: number) => number) => void

  // callbacks on zero
  onCountdownZero: () => void
  onPomodoroWorkZero: (now: number) => void
  onPomodoroBreakZero: (now: number) => void

  // state save per frame (optional)
  shouldSaveState?: boolean
  saveTimerState?: () => void
}

export function useTimerEngine(params: UseTimerEngineParams) {
  const {
    isRunning,
    isActive,
    timerType,
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
    onCountdownZero,
    onPomodoroWorkZero,
    onPomodoroBreakZero,
    shouldSaveState,
    saveTimerState,
  } = params

  useEffect(() => {
    if (!isRunning || !isActive) {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
        animationFrameRef.current = null
      }
      return
    }

    const tick = () => {
      if (!startTimeRef.current || !isActive) {
        animationFrameRef.current = null
        return
      }

      const now = Date.now()
      const elapsed = Math.floor((now - startTimeRef.current) / 1000) + pausedElapsedRef.current

      if (timerType === 'countdown') {
        const remaining = Math.max(durationRef.current - elapsed, 0)
        setDisplayTime(remaining)
        if (remaining === 0) {
          onCountdownZero()
          return
        }
      } else if (timerType === 'pomodoro') {
        if (pomodoroPhase === 'work') {
          const remaining = Math.max(workDurationRef.current - elapsed, 0)
          setDisplayTime(remaining)
          if (remaining === 0) {
            onPomodoroWorkZero(now)
          }
        } else {
          const remaining = Math.max(breakDurationRef.current - elapsed, 0)
          setDisplayTime(remaining)
          if (remaining === 0) {
            onPomodoroBreakZero(now)
          }
        }
      } else {
        setDisplayTime(elapsed)
      }

      if (lastUpdateTimeRef) lastUpdateTimeRef.current = now
      if (shouldSaveState && saveTimerState) saveTimerState()

      animationFrameRef.current = requestAnimationFrame(tick)
    }

    animationFrameRef.current = requestAnimationFrame(tick)

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
        animationFrameRef.current = null
      }
    }
  }, [
    isRunning,
    isActive,
    timerType,
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
    onCountdownZero,
    onPomodoroWorkZero,
    onPomodoroBreakZero,
    shouldSaveState,
    saveTimerState,
  ])
} 