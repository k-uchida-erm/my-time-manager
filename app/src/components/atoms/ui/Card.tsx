import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: 'sm' | 'md' | 'lg';
  shadow?: 'sm' | 'md' | 'lg';
}

const paddingVariants = {
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
};

const shadowVariants = {
  sm: 'shadow-sm',
  md: 'shadow-md',
  lg: 'shadow-lg',
};

export function Card({ 
  children, 
  className = '', 
  padding = 'md',
  shadow = 'sm'
}: CardProps) {
  return (
    <div className={`
      bg-card border rounded-xl ${paddingVariants[padding]} ${shadowVariants[shadow]}
      ${className}
    `}>
      {children}
    </div>
  );
} 