import React from 'react';
import { SketchPicker, ColorResult } from 'react-color';
import './input-colorPicker.css';

export interface InputColorPickerProps {
  label?: string;
  disabled?: boolean;
  value?: string;
  onChange?: (value: string) => void;
  onColorChange?: (color: ColorResult) => void;
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
    <div className="form-group">
      {label && <label>{label}</label>}
      <div className="input-container">
        <SketchPicker color={value} onChange={onSetValue} disabled={disabled} />
      </div>
    </div>
  );
}
