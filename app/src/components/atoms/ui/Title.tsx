import React from 'react';

interface TitleProps {
  children: React.ReactNode;
  className?: string;
}

export function Title({ children, className = "" }: TitleProps) {
  return (
    <h1 className={`font-bold text-blue-600 leading-tight ${className}`}>
      {children}
    </h1>
  );
} 