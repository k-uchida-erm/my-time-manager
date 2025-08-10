import React from 'react';

interface ToggleItemProps {
  title: React.ReactNode;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  className?: string;
}

export function ToggleItem({ 
  title, 
  description, 
  checked, 
  onChange, 
  className = "" 
}: ToggleItemProps) {
  return (
    <div className={`space-y-3 ${className}`}>
      <h3 className="text-base font-bold text-gray-900">{title}</h3>
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600 flex-1 pr-4">{description}</p>
        <div className="flex-shrink-0">
          <button
            type="button"
            onClick={() => onChange(!checked)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              checked ? 'bg-blue-600' : 'bg-gray-300'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                checked ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>
    </div>
  );
} 