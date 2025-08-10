import React from 'react';
import { EmptyState, Button } from '../atoms/ui';

interface TimerEmptyStateProps {
  onCreateTimer: () => void;
  className?: string;
}

export function TimerEmptyState({ onCreateTimer, className = "" }: TimerEmptyStateProps) {
  const icon = (
    <div className="w-24 h-24 border-2 border-muted-foreground/30 rounded-full relative">
      {/* 時計の針 */}
      <div className="absolute top-1/2 left-1/2 w-0.5 h-8 bg-muted-foreground/50 transform -translate-x-1/2 -translate-y-full origin-bottom"></div>
      <div className="absolute top-1/2 left-1/2 w-0.5 h-6 bg-muted-foreground/30 transform -translate-x-1/2 -translate-y-full origin-bottom rotate-45"></div>
      {/* 中心点 */}
      <div className="absolute top-1/2 left-1/2 w-2 h-2 bg-muted-foreground/50 rounded-full transform -translate-x-1/2 -translate-y-1/2"></div>
    </div>
  );

  const actionButton = (
    <Button
      onClick={onCreateTimer}
      className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
    >
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
      </svg>
      最初のタイマーを作成
    </Button>
  );

  return (
    <EmptyState
      icon={icon}
      title="新規タイマーを作成"
      description="あなた好みのタイマーを作成して時間管理を始めましょう"
      actionButton={actionButton}
      className={className}
    />
  );
} 