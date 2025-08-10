import React from 'react';

interface LoadingSpinnerProps {
  message?: string;
  className?: string;
}

export function LoadingSpinner({ message = "読み込み中...", className = "" }: LoadingSpinnerProps) {
  return (
    <div className={`text-center ${className}`}>
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
      <p className="mt-4 text-muted-foreground">{message}</p>
    </div>
  );
} 