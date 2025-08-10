import React from 'react';
import { Icon } from './Icon';

interface ContentTitleProps {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  className?: string;
}

export function ContentTitle({ icon, title, subtitle, className = "" }: ContentTitleProps) {
  return (
    <div className={`flex items-center gap-4 ${className}`}>
      <Icon 
        icon={icon} 
        size="w-5 h-5" 
        className="w-12 h-12" 
      />
      <div className="flex-1">
        <h2 className="text-2xl font-bold text-gray-900 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">{title}</h2>
        {subtitle && (
          <p className="text-sm text-gray-600 mt-1 font-medium">{subtitle}</p>
        )}
      </div>
    </div>
  );
} 