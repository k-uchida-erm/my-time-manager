'use client'

import { useState, useMemo, useEffect } from 'react';
import { TimeEntry } from '@/lib/types';
import { Tabs } from '@/components/atoms/ui';

interface MonthlyReportClientProps {
  entries: TimeEntry[];
  customTimers: Array<{ id: string; title: string; color: string }>;
  daysInMonth: number;
  currentMonth: number;
  currentYear: number;
}

export function MonthlyReportClient({ 
  entries, 
  customTimers, 
  daysInMonth, 
  currentMonth, 
  currentYear 
}: MonthlyReportClientProps) {
  const [selectedTimerId, setSelectedTimerId] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  // Ensure client-side rendering to prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // タブの設定（全タイマー + 全体）
  const tabs = [
    { id: 'all', label: '全体', icon: null, color: '#6B7280' },
    ...customTimers.map(timer => ({
      id: timer.id,
      label: timer.title,
      icon: null,
      color: timer.color
    }))
  ];

  // 選択されたタイマーの記録をフィルタリング
  const filteredEntries = useMemo(() => {
    if (!selectedTimerId || selectedTimerId === 'all') {
      return entries;
    }
    return entries.filter(entry => entry.timer_title === customTimers.find(t => t.id === selectedTimerId)?.title);
  }, [entries, selectedTimerId, customTimers]);

  // 日別の記録時間を計算
  const dailyData = useMemo(() => {
    const data = new Array(daysInMonth).fill(0).map((_, index) => ({
      day: index + 1,
      duration: 0,
      hasEntries: false
    }));

    filteredEntries.forEach(entry => {
      const entryDate = new Date(entry.start_time);
      const day = entryDate.getDate();
      if (day >= 1 && day <= daysInMonth) {
        data[day - 1].duration += entry.duration_seconds;
        data[day - 1].hasEntries = true;
      }
    });

    return data;
  }, [filteredEntries, daysInMonth]);

  // 最大時間を計算（グラフのスケール用）
  const maxDuration = useMemo(() => {
    const max = Math.max(...dailyData.map(d => d.duration), 1);
    return max;
  }, [dailyData]);

  // 縦軸の時間スケールを計算
  const timeScale = useMemo(() => {
    if (!mounted) return [8, 6, 4, 2, 0]; // 初期表示時は固定値
    
    const maxHours = Math.ceil(maxDuration / 3600); // 最大時間を時間単位で切り上げ
    const step = Math.max(1, Math.ceil(maxHours / 4)); // 4段階に分ける
    
    const scale = [];
    for (let i = 4; i >= 0; i--) {
      scale.push(i * step);
    }
    return scale;
  }, [maxDuration, mounted]);

  // 時間を分単位でフォーマット
  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}時間${minutes > 0 ? minutes + '分' : ''}`;
    }
    return `${minutes}分`;
  };

  // 時間を時間単位でフォーマット（グラフ表示用）
  const formatDurationForGraph = (seconds: number) => {
    return (seconds / 3600).toFixed(1);
  };

  // グラフの高さを計算する関数
  const getBarHeight = (dayData: { duration: number; hasEntries: boolean }) => {
    if (!mounted) return '4px'; // 初期表示時は最小の高さ
    if (!dayData.hasEntries) return '4px';
    
    const maxHours = Math.ceil(maxDuration / 3600);
    const step = Math.max(1, Math.ceil(maxHours / 4));
    const maxHeight = 200; // 最大高さ
    
    // 縦軸の最大値（4 * step）に対する現在の時間の割合で高さを計算
    const currentHours = dayData.duration / 3600;
    const heightRatio = currentHours / (step * 4);
    
    return `${Math.max(heightRatio * maxHeight, 4)}px`;
  };

  // グラフの色を決定する関数
  const getBarColor = (dayData: { duration: number; hasEntries: boolean }) => {
    if (!mounted) return 'bg-gray-200'; // 初期表示時は灰色
    return dayData.hasEntries ? 'bg-blue-500 hover:bg-blue-600' : 'bg-gray-200';
  };

  return (
    <div className="space-y-0">
      {/* タブヘッダー */}
      <div className="flex items-center justify-between">
        <Tabs 
          tabs={tabs} 
          activeTab={selectedTimerId || 'all'} 
          onTabChange={(tabId) => setSelectedTimerId(tabId)}
        />
      </div>
      
      {/* セクションコンテンツの大きな枠 */}
      <div className="bg-white/80 backdrop-blur-sm border-l border-r border-b border-gray-200 rounded-b-2xl p-6">
        {/* 日別棒グラフ */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">日別記録時間</h3>
          
          {/* グラフコンテナ */}
          <div className="bg-gray-50 rounded-lg p-4">
            {/* グラフエリア */}
            <div className="relative h-64">
              {/* 縦軸の線 */}
              <div className="absolute left-12 top-0 bottom-8 w-px bg-gray-300"></div>
              
              {/* 横軸の線 */}
              <div className="absolute left-12 right-0 bottom-8 h-px bg-gray-300"></div>
              
              {/* 縦軸の時間ラベル */}
              <div className="absolute left-0 top-0 bottom-8 w-12 flex flex-col justify-between">
                {timeScale.map((hours) => (
                  <div key={hours} className="flex items-center justify-end pr-2 text-xs text-gray-600">
                    <span>{hours}h</span>
                  </div>
                ))}
              </div>
              
              {/* 横軸の目盛り線 */}
              <div className="absolute left-12 right-0 bottom-8">
                <div 
                  className="h-full"
                  style={{
                    display: 'grid',
                    gridTemplateColumns: `repeat(${daysInMonth}, 1fr)`,
                    gap: '0.25rem'
                  }}
                >
                  {dailyData.map((_, index) => (
                    <div key={index} className="flex justify-center">
                      <div className="w-px h-2 bg-gray-200"></div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* 棒グラフ */}
              <div className="absolute left-12 right-0 top-0 bottom-8">
                <div 
                  className="h-full"
                  style={{
                    display: 'grid',
                    gridTemplateColumns: `repeat(${daysInMonth}, 1fr)`,
                    gap: '0.25rem'
                  }}
                >
                  {dailyData.map((dayData, index) => (
                    <div key={index} className="flex flex-col items-center justify-end group">
                      {/* 棒グラフ */}
                      <div className="relative w-full">
                        <div 
                          className={`w-full transition-all duration-300 ${getBarColor(dayData)} rounded-t-sm`}
                          style={{
                            height: getBarHeight(dayData)
                          }}
                        />
                        
                        {/* ツールチップ */}
                        {dayData.hasEntries && mounted && (
                          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                            {dayData.day}日: {formatDuration(dayData.duration)}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* 日付ラベル */}
              <div className="absolute left-12 right-0 bottom-0">
                <div 
                  className="h-8"
                  style={{
                    display: 'grid',
                    gridTemplateColumns: `repeat(${daysInMonth}, 1fr)`,
                    gap: '0.25rem'
                  }}
                >
                  {dailyData.map((dayData, index) => (
                    <div key={index} className="flex justify-center items-center">
                      <span className="text-xs text-gray-600">{dayData.day}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 