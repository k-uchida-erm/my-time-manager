import React from 'react';

interface SubtitleProps {
  children: React.ReactNode;
  className?: string;
}

export function Subtitle({ children, className = "" }: SubtitleProps) {
  return (
    <p className={`text-gray-600 ${className}`}>
      {children}
    </p>
  );
} 