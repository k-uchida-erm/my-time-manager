import React from 'react';
import { ModalTitle, ModalCloseButton } from '../atoms/modal';

interface ModalHeaderProps {
  title: string;
  onClose: () => void;
  className?: string;
}

export function ModalHeader({ title, onClose, className = "" }: ModalHeaderProps) {
  return (
    <div className={`flex items-center justify-between mb-2 ${className}`}>
      <ModalTitle>{title}</ModalTitle>
      <ModalCloseButton onClose={onClose} />
    </div>
  );
} 