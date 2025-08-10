import React from 'react';
import { Card } from '../ui';

interface ModalContainerProps {
  children: React.ReactNode;
  maxWidth?: string;
  className?: string;
}

export function ModalContainer({ children, maxWidth = "max-w-xl", className = "" }: ModalContainerProps) {
  return (
    <div className={`w-full ${maxWidth}`}>
      <Card className={`p-4 bg-white border border-gray-200 shadow-xl max-h-[90vh] overflow-y-auto modal-scrollbar ${className}`}>
        {children}
      </Card>
    </div>
  );
} 