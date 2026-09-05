import React from 'react';
import { ColorResult, SketchPicker } from 'react-color';
import '../types/react-color.d.ts';

export interface InputColorPickerProps {
  label?: string;
  disabled?: boolean;
  value?: string;
  onChange?: (value: string) => void;
  onColorChange?: (color: ColorResult) => void;
  className?: string;
}

export function InputColorPicker({
  label,
  disabled = false,
  value = '#000000',
  onChange,
  onColorChange,
  className = '',
}: InputColorPickerProps) {
  const onSetValue = (color: ColorResult) => {
    onChange?.(color.hex);
    onColorChange?.(color);
  };

  return (
    <div className={`form-group ${className}`.trim()}>
      {label && <label>{label}</label>}
      <div className="input-container">
        <SketchPicker color={value} onChange={onSetValue} disabled={disabled} />
      </div>
    </div>
  );
}
