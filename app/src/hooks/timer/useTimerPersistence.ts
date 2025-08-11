import { useCallback } from 'react';
import type { PersistedTimerState } from '@/lib/timerTypes'

export function useTimerPersistence(timerId: string) {
  const storageKey = `timer_${timerId}`;

  const loadState = useCallback((): PersistedTimerState | null => {
    try {
      const raw = typeof window !== 'undefined' ? localStorage.getItem(storageKey) : null;
      if (!raw) return null;
      return JSON.parse(raw) as PersistedTimerState;
    } catch {
      return null;
    }
  }, [storageKey]);

  const saveState = useCallback((state: PersistedTimerState) => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(state));
    } catch {
      // ignore
    }
  }, [storageKey]);

  const clearState = useCallback(() => {
    try {
      localStorage.removeItem(storageKey);
    } catch {
      // ignore
    }
  }, [storageKey]);

  const setupBeforeUnload = useCallback((getState: () => PersistedTimerState) => {
    const onBeforeUnload = () => {
      try { saveState(getState()); } catch {}
    };
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, [saveState]);

  return { loadState, saveState, clearState, setupBeforeUnload };
} 