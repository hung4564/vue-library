import {
  isMapButtonFluidVariant,
  type MapButtonSize,
  type MapButtonVariant,
  mapButtonSizeClass,
  mapButtonVariantClass,
} from '@hungpvq/map-core';
import { BaseButton, Icon } from '@hungpvq/react-ui-core';
import React, { createContext, useContext } from 'react';

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

function buttonClassName(
  variant: MapButtonVariant,
  size: MapButtonSize | string | undefined,
  active: boolean,
  disabled: boolean,
) {
  return [
    'map-control-button',
    mapButtonVariantClass(variant),
    mapButtonSizeClass(size),
    active ? 'map-control-button-active' : '',
    disabled ? 'map-control-button-disabled' : '',
  ]
    .filter(Boolean)
    .join(' ');
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
  className = '',
  style,
  ...props
}: MapControlButtonProps) {
  const groupContext = useContext(MapControlButtonGroupContext);
  const isGroup = groupContext?.isGroup ?? false;
  const groupSize = groupContext?.groupSize;

  const label = tooltip || title;
  const isFluid = isMapButtonFluidVariant(variant);
  const resolvedSize =
    isGroup && groupSize != null && groupSize !== '' ? groupSize : size;
  const resolvedVariant = isGroup && !isFluid ? 'icon' : variant;
  const mapClass = buttonClassName(
    resolvedVariant,
    resolvedSize,
    active,
    disabled,
  );

  const body = (
    <BaseButton
      className={[mapClass, className].filter(Boolean).join(' ')}
      style={style}
      variant={resolvedVariant}
      size={resolvedSize}
      active={active}
      title={label}
      aria-label={label}
      aria-pressed={active}
      disabled={disabled}
      loading={loading}
      {...props}
    >
      <span className="map-control-button__content">
        {children || (isFluid ? null : <Icon>{icon}</Icon>)}
      </span>
    </BaseButton>
  );

  if (isGroup || isFluid) {
    return body;
  }

  return (
    <div className="button-container">
      <div title={label}>{contentButton || body}</div>
    </div>
  );
}

// Export context provider for MapControlGroupButton
export { MapControlButtonGroupContext };
