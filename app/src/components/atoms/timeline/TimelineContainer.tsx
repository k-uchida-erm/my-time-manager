import React, { forwardRef } from 'react';

interface TimelineContainerProps {
  children: React.ReactNode;
  className?: string;
  height?: string;
  maxHeight?: string;
  onScroll?: (scrollTop: number) => void;
}

export const TimelineContainer = forwardRef<HTMLDivElement, TimelineContainerProps>(({ 
  children, 
  className = "",
  height = "500px",
  maxHeight = "500px",
  onScroll
}, ref) => {
  return (
    <div 
      ref={ref}
      className={`relative bg-muted rounded-lg overflow-auto ${className}`}
      style={{ 
        height,
        maxHeight
      }}
      onScroll={(e) => onScroll?.(e.currentTarget.scrollTop)}
    >
      {children}
    </div>
  );
});

TimelineContainer.displayName = 'TimelineContainer'; 