import {
  isMapButtonFluidVariant,
  type MapButtonSize,
  type MapButtonVariant,
} from '@hungpvq/map-core';
import React, { createContext, useContext } from 'react';
import { MapButton } from './MapButton';
import { MapIcon } from './MapIcon';

interface MapControlButtonGroupContextValue {
  isGroup: boolean;
  groupSize: MapButtonSize | string;
}

const MapControlButtonGroupContext =
  createContext<MapControlButtonGroupContextValue | null>(null);

export interface MapControlButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon?: string | boolean;
  tooltip?: string;
  title?: string;
  loading?: boolean;
  /** small | medium | large | number (px). Applies to every variant. */
  size?: MapButtonSize | string;
  active?: boolean;
  disabled?: boolean;
  /** icon (default) | plain | text | tonal | outlined | filled */
  variant?: MapButtonVariant;
  contentButton?: React.ReactNode;
  children?: React.ReactNode;
}

export function MapControlButton({
  icon,
  tooltip,
  title,
  loading = false,
  size = 'medium',
  active = false,
  disabled = false,
  variant = 'icon',
  contentButton,
  children,
  ...props
}: MapControlButtonProps) {
  const groupContext = useContext(MapControlButtonGroupContext);
  const isGroup = groupContext?.isGroup ?? false;
  const groupSize = groupContext?.groupSize;

  const label = tooltip || title;
  const isFluid = isMapButtonFluidVariant(variant);
  const resolvedSize =
    isGroup && groupSize != null && groupSize !== '' ? groupSize : size;

  if (isGroup || isFluid) {
    return (
      <MapButton
        variant={isFluid ? variant : 'icon'}
        size={resolvedSize}
        active={active}
        title={label}
        aria-label={label}
        aria-pressed={active}
        disabled={disabled}
        loading={loading}
        {...props}
      >
        {children || (isFluid ? null : <MapIcon>{icon}</MapIcon>)}
      </MapButton>
    );
  }

  return (
    <div className="button-container">
      <div title={label}>
        {contentButton || (
          <MapButton
            variant="icon"
            size={resolvedSize}
            active={active}
            loading={loading}
            disabled={disabled}
            aria-label={label}
            aria-pressed={active}
            {...props}
          >
            {children || <MapIcon>{icon}</MapIcon>}
          </MapButton>
        )}
      </div>
    </div>
  );
}

// Export context provider for MapControlGroupButton
export { MapControlButtonGroupContext };
