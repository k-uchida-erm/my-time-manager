import React from 'react';

interface TimerDisplayProps {
  time: number;
  phase?: string;
  completedPomodoros?: number;
  className?: string;
}

export function TimerDisplay({ time, phase, completedPomodoros, className = "" }: TimerDisplayProps) {
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className={`text-center ${className}`}>
      <div className="text-4xl font-bold text-gray-900 mb-2">
        {formatTime(time)}
      </div>
      {phase && (
        <div className="text-sm text-gray-600 mb-1">
          {phase}
        </div>
      )}
      {completedPomodoros && completedPomodoros > 0 && (
        <div className="text-xs text-gray-500">
          完了: {completedPomodoros}
        </div>
      )}
    </div>
  );
} 