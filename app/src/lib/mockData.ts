import { TimeEntry } from './types';

// モックタイムエントリデータ
export const mockTimeEntries: TimeEntry[] = [
  {
    id: 1,
    start_time: '2024-01-15T09:00:00.000Z',
    end_time: '2024-01-15T10:30:00.000Z',
    duration_seconds: 5400,
    note: 'プログラミング学習 - React基礎',
  },
  {
    id: 2,
    start_time: '2024-01-15T11:00:00.000Z',
    end_time: '2024-01-15T12:00:00.000Z',
    duration_seconds: 3600,
    note: '読書 - 技術書',
  },
  {
    id: 3,
    start_time: '2024-01-15T14:00:00.000Z',
    end_time: '2024-01-15T15:30:00.000Z',
    duration_seconds: 5400,
    note: '運動 - ジム',
  },
  {
    id: 4,
    start_time: '2024-01-15T16:00:00.000Z',
    end_time: '2024-01-15T17:00:00.000Z',
    duration_seconds: 3600,
    note: '勉強 - 数学',
  },
  {
    id: 5,
    start_time: '2024-01-15T19:00:00.000Z',
    end_time: '2024-01-15T20:30:00.000Z',
    duration_seconds: 5400,
    note: 'プログラミング学習 - Next.js',
  }
];

// グラフ用データを生成する関数
export function getMockChartData() {
  return mockTimeEntries.map(entry => {
    const date = new Date(entry.start_time).toISOString().split('T')[0];
    return {
      date,
      duration: Math.round(entry.duration_seconds / 60), // 分単位に変換
      tagName: 'タグなし',
      color: '#888888'
    };
  });
}

// カレンダー用データを生成する関数
export function getMockCalendarEntries() {
  const entries: Array<{ date: string; duration: number; hasEntries: boolean }> = [];
  
  mockTimeEntries.forEach(entry => {
    const date = new Date(entry.start_time).toISOString().split('T')[0];
    const existingEntry = entries.find(e => e.date === date);
    
    if (existingEntry) {
      existingEntry.duration += Math.round(entry.duration_seconds / 60);
    } else {
      entries.push({
        date,
        duration: Math.round(entry.duration_seconds / 60),
        hasEntries: true
      });
    }
  });
  
  return entries;
}

// 日付ごとのタイムラインエントリを生成する関数
export function getMockDailyEntries() {
  const dailyEntries: { [key: string]: TimeEntry[] } = {};
  
  mockTimeEntries.forEach(entry => {
    const date = new Date(entry.start_time).toISOString().split('T')[0];
    if (!dailyEntries[date]) {
      dailyEntries[date] = [];
    }
    dailyEntries[date].push(entry);
  });
  
  return dailyEntries;
} 