import React from 'react';

interface ColorOption {
  value: string;
  label: string;
}

interface ColorPickerProps {
  colors: ColorOption[];
  selectedColor: string;
  onColorChange: (color: string) => void;
  className?: string;
}

export function ColorPicker({ colors, selectedColor, onColorChange, className = "" }: ColorPickerProps) {
  return (
    <div className={className}>
      <label className="block text-base font-bold text-gray-900 mb-3">
        色
      </label>
      <div className="grid grid-cols-4 gap-1">
        {colors.map((colorOption) => (
          <button
            key={colorOption.value}
            type="button"
            className={`w-6 h-6 rounded-full border-2 transition-all ${
              selectedColor === colorOption.value
                ? 'border-foreground scale-110'
                : 'border-border hover:scale-105'
            }`}
            style={{ backgroundColor: colorOption.value }}
            onClick={() => onColorChange(colorOption.value)}
          />
        ))}
      </div>
      {colors.length === 0 && (
        <p className="text-xs text-muted-foreground mt-1">
          利用可能な色がありません。
        </p>
      )}
    </div>
  );
} 