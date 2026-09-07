import type { CSSProperties } from 'react';
import Sketch from '@uiw/react-color-sketch';

export interface ColorResult {
  hex: string;
  rgb: { r: number; g: number; b: number; a?: number };
  hsl: { h: number; s: number; l: number; a?: number };
}

export interface InputColorPickerProps {
  label?: string;
  disabled?: boolean;
  disableAlpha?: boolean;
  value?: string;
  onChange?: (value: string) => void;
  onColorChange?: (color: ColorResult) => void;
  className?: string;
}

export function InputColorPicker({
  label,
  disabled = false,
  disableAlpha = false,
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
      <div
        className="input-container"
        style={disabled ? { pointerEvents: 'none', opacity: 0.6 } : undefined}
      >
        <Sketch
          color={value}
          disableAlpha={disableAlpha}
          onChange={onSetValue}
          style={
            {
              width: '100%',
              '--sketch-background': 'transparent',
              '--sketch-box-shadow': 'unset',
              '--sketch-swatch-border-top':
                '1px solid var(--map-divider-color, var(--map-border-color, #fff))',
            } as CSSProperties
          }
        />
      </div>
    </div>
  );
}
