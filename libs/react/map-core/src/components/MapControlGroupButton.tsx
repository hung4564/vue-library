import React, { useMemo } from 'react';
import { MapButton } from './MapButton';
import { MapControlButtonGroupContext } from './MapControlButton';
import { MapIcon } from './MapIcon';

export interface ButtonItem {
  title: string;
  icon: string;
  onClick: (e: React.MouseEvent) => void;
}

export interface MapControlGroupButtonProps extends React.HTMLAttributes<HTMLDivElement> {
  items?: ButtonItem[];
  row?: boolean;
  size?: number | string;
  children?: React.ReactNode;
}

export function MapControlGroupButton({
  items = [],
  row = false,
  size = 32,
  children,
  className = '',
  style,
  ...props
}: MapControlGroupButtonProps) {
  const sizeNum = typeof size === 'string' ? parseInt(size, 10) : size;

  const containerStyle = useMemo(
    () => ({
      width: !row ? `${sizeNum}px` : undefined,
      height: row ? `${sizeNum}px` : undefined,
      ...style,
    }),
    [row, sizeNum, style],
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
      value={{ isGroup: true, groupSize: sizeNum }}
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
              height={sizeNum}
              width={sizeNum}
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
