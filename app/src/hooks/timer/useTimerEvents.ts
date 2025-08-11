import { useCallback } from 'react';
import { saveTimerEvent } from '@/app/actions';

export type TimerEventType = 'start' | 'pause' | 'resume' | 'complete' | 'reset' | 'pomodoro_complete' | 'break_complete';

export function useTimerEvents(timerId: string, getElapsedSeconds: () => number) {
  const saveEvent = useCallback(async (eventType: TimerEventType, note?: string) => {
    try {
      const formData = new FormData();
      formData.append('timerId', timerId);
      formData.append('eventType', eventType);
      formData.append('eventTime', Date.now().toString());
      formData.append('elapsedSeconds', String(getElapsedSeconds()));
      if (note) {
        formData.append('note', note);
      }

      const result = await saveTimerEvent(formData);
      if ((result as { error?: string })?.error) {
        console.error('Failed to save timer event:', (result as { error?: string })?.error);
      }
    } catch (error) {
      console.error('Error saving timer event:', error);
    }
  }, [timerId, getElapsedSeconds]);

  return { saveEvent };
} 