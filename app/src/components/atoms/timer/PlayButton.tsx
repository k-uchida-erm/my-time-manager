import React from 'react';
import { IconButton } from '../ui';

interface PlayButtonProps {
  isRunning: boolean;
  onStart: () => void;
  onStop: () => void;
  className?: string;
}

export function PlayButton({ isRunning, onStart, onStop, className = "" }: PlayButtonProps) {
  return (
    <IconButton
      onClick={isRunning ? onStop : onStart}
      variant={isRunning ? 'danger' : 'primary'}
      size="lg"
      className={`hover:scale-110 group transition-all duration-300 ease-out shadow-lg hover:shadow-xl ${className}`}
    >
      {isRunning ? (
        <svg className="w-10 h-10 group-hover:scale-110 transition-transform duration-300 ease-out" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z" clipRule="evenodd" />
        </svg>
      ) : (
        <svg className="w-10 h-10 group-hover:scale-110 transition-transform duration-300 ease-out" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
        </svg>
      )}
    </IconButton>
  );
} 