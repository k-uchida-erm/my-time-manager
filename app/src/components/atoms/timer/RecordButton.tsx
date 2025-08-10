import React from 'react';
import { IconButton } from '../ui';

interface RecordButtonProps {
  onClick: () => void;
  disabled?: boolean;
  className?: string;
}

export function RecordButton({ onClick, disabled = false, className = "" }: RecordButtonProps) {
  return (
    <IconButton
      onClick={onClick}
      variant="success"
      size="lg"
      disabled={disabled}
      className={`hover:scale-110 transition-all duration-300 ease-out shadow-lg hover:shadow-xl group ${className}`}
    >
      <svg className="w-6 h-6 group-hover:scale-110 transition-transform duration-300 ease-out" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
      </svg>
    </IconButton>
  );
} 