import React from 'react';

interface GradientBackgroundProps {
  children: React.ReactNode;
  variant?: 'header' | 'timeline' | 'timer';
  className?: string;
}

export function GradientBackground({ 
  children, 
  variant = 'header',
  className = '' 
}: GradientBackgroundProps) {
  const variants = {
    header: {
      background: 'bg-gradient-to-r from-blue-50 to-orange-50',
      decorations: []
    },
    timeline: {
      background: 'bg-gradient-to-br from-orange-50 to-blue-50',
      decorations: []
    },
    timer: {
      background: 'bg-gradient-to-br from-blue-50 to-purple-50',
      decorations: []
    }
  };

  const currentVariant = variants[variant];

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* 背景グラデーション */}
      <div className={`absolute inset-0 ${currentVariant.background}`}></div>
      
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
} 