import React, { useId } from 'react';

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'onChange'> {
  label?: string;
  error?: string;
  helperText?: string;
  options: SelectOption[];
  placeholder?: string;
  onChange?: (value: string) => void;
}

export function Select({ 
  label, 
  error, 
  helperText, 
  options, 
  placeholder,
  onChange,
  className = '',
  id,
  ...props 
}: SelectProps) {
  const selectId = useId();
  const finalId = id || selectId;
  
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (onChange) {
      onChange(e.target.value);
    }
  };
  
  return (
    <div className="space-y-3">
      {label && (
        <label htmlFor={finalId} className="block text-base font-bold text-gray-900">
          {label}
        </label>
      )}
      
      <select
        id={finalId}
        className={`
          w-full px-4 py-3 border border-input bg-input rounded-lg 
          focus:ring-2 focus:ring-ring focus:border-transparent 
          transition-colors duration-200
          ${error ? 'border-red-500 focus:ring-red-500' : ''}
          ${className}
        `}
        onChange={handleChange}
        {...props}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      
      {(error || helperText) && (
        <p className={`text-sm ${error ? 'text-red-500' : 'text-muted-foreground'}`}>
          {error || helperText}
        </p>
      )}
    </div>
  );
} 