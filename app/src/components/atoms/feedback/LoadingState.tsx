import React from 'react';
import { LoadingSpinner } from './LoadingSpinner';

interface LoadingStateProps {
  message?: string;
  className?: string;
}

export function LoadingState({ 
  message = "読み込み中...", 
  className = "" 
}: LoadingStateProps) {
  return (
    <div className={`flex items-center justify-center min-h-[400px] ${className}`}>
      <div className="text-center space-y-4">
        <LoadingSpinner message={message} />
      </div>
    </div>
  );
} 