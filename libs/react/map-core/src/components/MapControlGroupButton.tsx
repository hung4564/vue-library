import React, { useMemo } from 'react';
import { MapButton } from './MapButton';
import { MapControlButtonGroupContext } from './MapControlButton';
import { MapIcon } from './MapIcon';
import {
  resolveMapButtonSizePx,
  type MapButtonSize,
} from './map-button-variant';

export interface ButtonItem {
  title: string;
  icon: string;
  onClick: (e: React.MouseEvent) => void;
}

export interface MapControlGroupButtonProps extends React.HTMLAttributes<HTMLDivElement> {
  items?: ButtonItem[];
  row?: boolean;
  /** small | medium | large | number (px) */
  size?: MapButtonSize | string;
  children?: React.ReactNode;
}

export function MapControlGroupButton({
  items = [],
  row = false,
  size = 'medium',
  children,
  className = '',
  style,
  ...props
}: MapControlGroupButtonProps) {
  const sizePx = resolveMapButtonSizePx(size);

  const containerStyle = useMemo(
    () => ({
      width: !row ? `${sizePx}px` : undefined,
      height: row ? `${sizePx}px` : undefined,
      ...style,
    }),
    [row, sizePx, style],
  );

  const classes = [
    'button-container',
    'button-group-container',
    row ? 'button-group-row-container' : 'button-group-column-container',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <MapControlButtonGroupContext.Provider
      value={{ isGroup: true, groupSize: sizePx }}
    >
      <div className={classes} style={containerStyle} {...props}>
        <div
          className={`button-group-sheet ${
            !row ? 'button-group-sheet-column' : ''
          }`}
          style={{ borderRadius: '150px' }}
        >
          {items.map((item, i) => (
            <MapButton
              key={i}
              size={sizePx}
              title={item.title}
              onClick={item.onClick}
            >
              <MapIcon>{item.icon}</MapIcon>
            </MapButton>
          ))}
          {children}
        </div>
      </div>
    </MapControlButtonGroupContext.Provider>
  );
}
