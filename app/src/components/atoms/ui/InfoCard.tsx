import React from 'react';

interface InfoCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  className?: string;
}

export function InfoCard({ 
  title, 
  value, 
  subtitle, 
  icon, 
  className = '' 
}: InfoCardProps) {
  return (
    <div className={`bg-white/60 backdrop-blur-sm rounded-lg lg:rounded-xl p-3 lg:p-4 text-center min-w-[80px] ${className}`}>
      {icon && (
        <div className="flex justify-center mb-2">
          {icon}
        </div>
      )}
      <div className="text-lg lg:text-2xl font-bold text-gray-900">
        {value}
      </div>
      <div className="text-xs lg:text-sm text-gray-600">
        {title}
      </div>
      {subtitle && (
        <div className="text-xs text-gray-500 mt-1">
          {subtitle}
        </div>
      )}
    </div>
  );
} 