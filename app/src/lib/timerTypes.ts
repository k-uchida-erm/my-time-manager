export type TimerType = 'countdown' | 'stopwatch' | 'pomodoro';
export type PomodoroPhase = 'work' | 'break';

export interface PersistedTimerState {
  isRunning: boolean;
  startTime: number | null;
  pausedElapsed: number;
  duration: number;
  workDuration: number;
  breakDuration: number;
  pomodoroPhase: PomodoroPhase;
  completedPomodoros: number;
  type: TimerType;
  lastUpdate: number;
  // legacy support key that may exist in old storage
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
} 