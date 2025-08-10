import React from 'react';

interface TimelineTimeMarkerProps {
  position: number;
  className?: string;
}

export function TimelineTimeMarker({ 
  position, 
  className = ""
}: TimelineTimeMarkerProps) {
  return (
    <div
      className={`absolute left-0 right-0 z-10 ${className}`}
      style={{ 
        top: `${position}px`,
        borderTop: '1.2px solid #f56565', // もう少し太い黄色寄りのオレンジ
      }}
    />
  );
} 