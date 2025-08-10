import React from 'react';
import { IconButton, Button } from '../ui';

interface TimerControlsProps {
  isRunning: boolean;
  onStart: () => void;
  onStop: () => void;
  onReset: () => void;
  onComplete: () => void;
  className?: string;
}

export function TimerControls({ 
  isRunning, 
  onStart, 
  onStop, 
  onReset, 
  onComplete,
  className = "" 
}: TimerControlsProps) {
  return (
    <div className={`flex justify-center items-center gap-4 ${className}`}>
      <IconButton
        onClick={isRunning ? onStop : onStart}
        size="lg"
        variant="primary"
      >
        {isRunning ? (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        ) : (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )}
      </IconButton>
      <IconButton
        onClick={onReset}
        size="md"
        variant="secondary"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      </IconButton>
      <Button onClick={onComplete} variant="outline">
        完了
      </Button>
    </div>
  );
} 