import React from 'react';

export interface MapIconProps extends React.HTMLAttributes<HTMLElement> {
  children?: React.ReactNode;
}

export function MapIcon({ children, className = '', ...props }: MapIconProps) {
  return (
    <i className={`map-icon mdi ${className}`} {...props}>
      {children}
    </i>
  );
}
