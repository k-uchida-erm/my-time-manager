import { useEffect, useMemo, useState } from 'react';
import { CustomTimer as CustomTimerType } from '@/components/molecules/TimerCreationModal';

const ORDER_STORAGE_KEY = 'timerOrder';

export function useTimerOrder(customTimers: CustomTimerType[]) {
  const [order, setOrder] = useState<string[] | null>(null);

  // 初期読み込み（localStorage）
  useEffect(() => {
    try {
      const raw = typeof window !== 'undefined' ? localStorage.getItem(ORDER_STORAGE_KEY) : null;
      if (raw) {
        const parsed = JSON.parse(raw) as string[];
        setOrder(parsed);
      }
    } catch {
      // ignore
    }
  }, []);

  // 並び替え後の配列
  const sortedTimers = useMemo(() => {
    if (!order) return customTimers;
    const map = new Map(customTimers.map(t => [t.id, t] as const));
    const ordered = order.map(id => map.get(id)).filter(Boolean) as CustomTimerType[];
    const remaining = customTimers.filter(t => !order.includes(t.id));
    return [...ordered, ...remaining];
  }, [customTimers, order]);

  // 永続化
  useEffect(() => {
    if (!sortedTimers.length) return;
    const ids = sortedTimers.map(t => t.id);
    try {
      localStorage.setItem(ORDER_STORAGE_KEY, JSON.stringify(ids));
    } catch {
      // ignore
    }
  }, [sortedTimers]);

  // 並び替えハンドラ
  const handleReorder = (sourceId: string, targetId: string) => {
    const current = order ?? customTimers.map(t => t.id);
    const from = current.indexOf(sourceId);
    const to = current.indexOf(targetId);
    if (from === -1 || to === -1) return;
    const next = [...current];
    next.splice(to, 0, next.splice(from, 1)[0]);
    setOrder(next);
  };

  return { sortedTimers, handleReorder };
} 