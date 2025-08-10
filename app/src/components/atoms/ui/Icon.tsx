import React from 'react';

interface IconProps {
  icon: React.ReactNode;
  size?: string;
  className?: string;
}

export function Icon({ icon, size = "w-6 h-6", className = "" }: IconProps) {
  return (
    <div className={`bg-gradient-to-br from-blue-500 via-indigo-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 ${className}`}>
      <div className={`text-white ${size}`}>
        {icon}
      </div>
    </div>
  );
} 