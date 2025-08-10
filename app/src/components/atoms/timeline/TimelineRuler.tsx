import React, { useState, useEffect } from 'react';

interface TimelineRulerProps {
  hours: number[];
  zoomLevel: number;
  baseHeight: number;
  showNumbers?: boolean;
  className?: string;
}

export function TimelineRuler({ 
  hours, 
  zoomLevel, 
  baseHeight, 
  showNumbers = true,
  className = ""
}: TimelineRulerProps) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <>
      {hours.map(hour => {
        // 線は毎時表示
        const showLine = true;
        
        // 数字は標準（100%）の時は偶数の時間のみ、拡大時は毎時表示
        const showNumber = showNumbers && (zoomLevel === 1 ? hour % 2 === 0 : true);
        
        // クライアントサイドでのみ正確な位置計算
        const topPosition = !isClient 
          ? `${hour * 20}px` 
          : `${(hour * baseHeight * zoomLevel) / 24 + 20}px`;
        
        return (
          <div
            key={hour}
            className={`absolute left-0 w-full border-b border-border/30 ${className}`}
            style={{ top: topPosition }}
          >
            {showNumber && (
              <span className="absolute left-2 text-xs text-muted-foreground bg-muted px-1 -top-2">
                {hour.toString().padStart(2, '0')}:00
              </span>
            )}
          </div>
        );
      })}
    </>
  );
} 