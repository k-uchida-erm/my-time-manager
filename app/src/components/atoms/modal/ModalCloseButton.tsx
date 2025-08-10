import React from 'react';

interface ModalCloseButtonProps {
  onClose: () => void;
  className?: string;
}

export function ModalCloseButton({ onClose, className = "" }: ModalCloseButtonProps) {
  return (
    <button
      onClick={onClose}
      className={`text-muted-foreground hover:text-foreground ${className}`}
    >
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
      </svg>
    </button>
  );
} 