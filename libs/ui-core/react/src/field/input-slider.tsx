import React, { useMemo } from 'react';

export interface InputSliderProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  'onChange'
> {
  label?: string;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
  value?: number;
  onChange?: (value: number) => void;
}

export function InputSlider({
  label,
  min = 0,
  max = 100,
  step = 1,
  disabled = false,
  value = 0,
  onChange,
  className = '',
  ...props
}: InputSliderProps) {
  const backgroundSize = useMemo(() => {
    return `${((value - min) * 100) / (max - min)}% 100%`;
  }, [value, min, max]);

  const handleRangeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseFloat(e.target.value);
    onChange?.(newValue);
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseFloat(e.target.value);
    onChange?.(newValue);
  };

  return (
    <div className="form-group">
      {label && <label>{label}</label>}
      <div className="input-container">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={handleRangeChange}
          disabled={disabled}
          style={{ backgroundSize }}
          className={className}
          {...props}
        />
        <div className="input-slider__value">
          <input
            type="number"
            min={min}
            max={max}
            step={step}
            value={value}
            onChange={handleNumberChange}
            disabled={disabled}
          />
        </div>
      </div>
    </div>
  );
}
