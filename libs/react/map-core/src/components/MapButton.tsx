import { mdiLoading } from '@mdi/js';
import { Icon } from '@mdi/react';
import React, { useMemo } from 'react';
import {
  isMapButtonSquareVariant,
  mapButtonSizeClass,
  mapButtonVariantClass,
  resolveMapButtonSizePx,
  type MapButtonSize,
  type MapButtonVariant,
} from './map-button-variant';

export type {
  MapButtonVariant,
  MapButtonSize,
  MapButtonSizeName,
} from './map-button-variant';

export interface MapButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** small | medium | large | number (px). Applies to every variant. */
  size?: MapButtonSize | string;
  loading?: boolean;
  active?: boolean;
  disabled?: boolean;
  /** icon | plain | text | tonal | outlined | filled */
  variant?: MapButtonVariant;
  children?: React.ReactNode;
}

export function MapButton({
  size = 'medium',
  loading = false,
  active = false,
  disabled = false,
  variant = 'icon',
  children,
  className = '',
  style,
  ...props
}: MapButtonProps) {
  const sizePx = resolveMapButtonSizePx(size);
  const isSquare = isMapButtonSquareVariant(variant);
  const sizeClass = mapButtonSizeClass(size);

  const bindStyle = useMemo(() => {
    if (isSquare) {
      return { width: `${sizePx}px`, height: `${sizePx}px`, ...style };
    }
    if (!sizeClass) {
      const pad = Math.round(sizePx / 4);
      return {
        minHeight: `${sizePx}px`,
        paddingLeft: `${pad}px`,
        paddingRight: `${pad}px`,
        ...style,
      };
    }
    return style;
  }, [isSquare, sizePx, sizeClass, style]);

  const classes = [
    'map-control-button',
    mapButtonVariantClass(variant),
    sizeClass,
    active ? 'map-control-button-active' : '',
    disabled ? 'map-control-button-disabled' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const spinnerSize = Math.round(sizePx * (2 / 3));

  return (
    <button
      type="button"
      className={classes}
      style={bindStyle}
      disabled={disabled}
      {...props}
    >
      <span className="map-control-button__content">
        {loading ? (
          <Icon path={mdiLoading} size={spinnerSize} className="spin" />
        ) : (
          children
        )}
      </span>
    </button>
  );
}
