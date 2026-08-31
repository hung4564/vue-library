import { useMemo } from 'react';

export interface LayerItemSliderProps {
  value: number;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
  onChange?: (value: number) => void;
}

export function LayerItemSlider({
  value,
  min = 0,
  max = 1,
  step = 0.01,
  disabled = false,
  onChange,
}: LayerItemSliderProps) {
  const backgroundSize = useMemo(
    () => `${((value - min) * 100) / (max - min)}% 100%`,
    [value, min, max],
  );

  return (
    <input
      type="range"
      className="layer-item-slider"
      min={min}
      max={max}
      step={step}
      value={value}
      disabled={disabled}
      style={{ backgroundSize }}
      onChange={(e) => onChange?.(parseFloat(e.target.value))}
    />
  );
}
