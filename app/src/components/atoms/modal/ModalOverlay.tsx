import React from 'react';

interface ModalOverlayProps {
  children: React.ReactNode;
  onClose?: () => void;
  className?: string;
}

export function ModalOverlay({ children, onClose, className = "" }: ModalOverlayProps) {
  return (
    <div 
      className={`fixed inset-0 bg-black/70 flex items-center justify-center z-[9999] backdrop-blur-sm p-4 ${className}`}
      onClick={onClose}
    >
      <div onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
} 