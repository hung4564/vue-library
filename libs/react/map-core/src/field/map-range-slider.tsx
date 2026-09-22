import { useMemo, type ChangeEvent } from 'react';

export interface MapRangeSliderProps {
  value?: number;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
  className?: string;
  'aria-label'?: string;
  onChange?: (value: number) => void;
}

export function MapRangeSlider({
  value = 0,
  min = 0,
  max = 1,
  step = 0.01,
  disabled = false,
  className = '',
  'aria-label': ariaLabel,
  onChange,
}: MapRangeSliderProps) {
  const backgroundSize = useMemo(() => {
    const span = max - min;
    if (span <= 0) return '0% 100%';
    return `${((value - min) * 100) / span}% 100%`;
  }, [value, min, max]);

  return (
    <input
      type="range"
      className={['map-range-slider', className].filter(Boolean).join(' ')}
      min={min}
      max={max}
      step={step}
      value={value}
      disabled={disabled}
      aria-label={ariaLabel}
      style={{ backgroundSize }}
      onChange={(event: ChangeEvent<HTMLInputElement>) => {
        const next = parseFloat(event.target.value);
        onChange?.(Number.isFinite(next) ? next : min);
      }}
    />
  );
}
