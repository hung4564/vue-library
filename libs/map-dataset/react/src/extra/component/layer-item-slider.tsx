import { MapRangeSlider } from '@hungpvq/react-map-core/fields';

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
  return (
    <MapRangeSlider
      className="layer-item-slider"
      value={value}
      min={min}
      max={max}
      step={step}
      disabled={disabled}
      onChange={onChange}
    />
  );
}
