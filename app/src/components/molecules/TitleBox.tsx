import React from 'react';
import { GradientBackground } from '../atoms/ui';
import { TitleHeader } from './TitleHeader';
import { InfoCardGroup } from './InfoCardGroup';

interface DateSnapshot {
  day: string; // '11'
  monthLabel: string; // '8月' 等（ja-JP 短縮）
  weekdayLabel: string; // '日' 等（ja-JP 短縮）
  year: string; // '2025'
}

interface TitleBoxProps {
  today: Date;
  entryCount: number;
  totalHours?: number;
  totalMinutes?: number;
  dateSnapshot?: DateSnapshot;
}

export function TitleBox({ today, entryCount, totalHours = 0, totalMinutes = 0, dateSnapshot }: TitleBoxProps) {
  // スナップショットがあればそれを使用（SSRと一致させる）
  const day = dateSnapshot ? dateSnapshot.day : today.getDate().toString();
  const monthLabel = dateSnapshot ? dateSnapshot.monthLabel : today.toLocaleDateString('ja-JP', { month: 'short' });
  const weekdayLabel = dateSnapshot ? dateSnapshot.weekdayLabel : today.toLocaleDateString('ja-JP', { weekday: 'short' });
  const year = dateSnapshot ? dateSnapshot.year : today.getFullYear().toString();

  const icon = (
    <svg fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
    </svg>
  );

  const infoCards = [
    { title: '日', value: day, subtitle: monthLabel },
    { title: '曜日', value: weekdayLabel, subtitle: year },
    { title: '記録', value: entryCount.toString(), subtitle: `${totalHours}時間${totalMinutes}分` },
  ];

  return (
    <GradientBackground variant="header" className="p-6 sm:p-8 rounded-2xl border border-gray-200 bg-white/80 backdrop-blur-sm">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 lg:gap-6">
        <div className="space-y-3 lg:space-y-4">
          <TitleHeader icon={icon} title="My Time Manager" subtitle="今日の時間を効率的に管理しましょう" />
        </div>
        <InfoCardGroup cards={infoCards} />
      </div>
    </GradientBackground>
  );
} 