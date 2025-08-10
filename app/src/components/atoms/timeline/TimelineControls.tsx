import React from 'react';

interface TimelineControlsProps {
  zoomLevel: number;
  onZoomChange: (zoom: number) => void;
  className?: string;
}

export function TimelineControls({ 
  zoomLevel, 
  onZoomChange,
  className = ""
}: TimelineControlsProps) {
  const zoomLevels = [1, 2.5, 5];
  const currentIndex = zoomLevels.indexOf(zoomLevel);

  const handleZoomClick = () => {
    const nextIndex = (currentIndex + 1) % zoomLevels.length;
    onZoomChange(zoomLevels[nextIndex]);
  };

  return (
    <button
      onClick={handleZoomClick}
      className={`absolute top-2 right-2 z-20 p-1.5 bg-white/80 backdrop-blur-sm rounded-md border border-gray-200 text-muted-foreground hover:text-foreground transition-colors shadow-sm ${className}`}
      title={`ズーム: ${zoomLevel * 100}%`}
    >
      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    </button>
  );
} 