import { mdiLoading } from '@mdi/js';
import { Icon } from '@mdi/react';
import React, { useMemo } from 'react';

export interface MapButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  height?: number;
  width?: number;
  loading?: boolean;
  active?: boolean;
  disabled?: boolean;
  children?: React.ReactNode;
}

export function MapButton({
  height = 32,
  width = 32,
  loading = false,
  active = false,
  disabled = false,
  children,
  className = '',
  style,
  ...props
}: MapButtonProps) {
  const bindStyle = useMemo(
    () => ({
      width: `${width}px`,
      height: `${height}px`,
      ...style,
    }),
    [width, height, style],
  );

  const classes = [
    'map-control-button',
    active ? 'map-control-button-active' : '',
    disabled ? 'map-control-button-disabled' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

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
          <Icon path={mdiLoading} size={(height * 2) / 3} className="spin" />
        ) : (
          children
        )}
      </span>
    </button>
  );
}
