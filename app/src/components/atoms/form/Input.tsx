import React, { useId } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export function Input({ 
  label, 
  error, 
  helperText, 
  leftIcon, 
  rightIcon,
  className = '',
  id,
  ...props 
}: InputProps) {
  const inputId = useId();
  const finalId = id || inputId;
  
  return (
    <div className="space-y-3">
      {label && (
        <label htmlFor={finalId} className="block text-base font-bold text-gray-900">
          {label}
        </label>
      )}
      
      <div className="relative">
        {leftIcon && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
            {leftIcon}
          </div>
        )}
        
        <input
          id={finalId}
          className={`
            w-full px-4 py-3 border border-input bg-input rounded-lg 
            focus:ring-2 focus:ring-ring focus:border-transparent 
            transition-colors duration-200
            ${leftIcon ? 'pl-10' : ''}
            ${rightIcon ? 'pr-10' : ''}
            ${error ? 'border-red-500 focus:ring-red-500' : ''}
            ${className}
          `}
          {...props}
        />
        
        {rightIcon && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
            {rightIcon}
          </div>
        )}
      </div>
      
      {(error || helperText) && (
        <p className={`text-sm ${error ? 'text-red-500' : 'text-muted-foreground'}`}>
          {error || helperText}
        </p>
      )}
    </div>
  );
} 