import React from 'react';
import { ModalOverlay, ModalContainer } from '../atoms/modal';
import { ModalHeader } from '../molecules/ModalHeader';

interface BaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  maxWidth?: string;
  className?: string;
}

export function BaseModal({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  maxWidth = "max-w-xl",
  className = "" 
}: BaseModalProps) {
  if (!isOpen) return null;

  return (
    <ModalOverlay onClose={onClose}>
      <ModalContainer maxWidth={maxWidth} className={className}>
        <ModalHeader title={title} onClose={onClose} />
        {children}
      </ModalContainer>
    </ModalOverlay>
  );
} 