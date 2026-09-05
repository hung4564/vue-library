import React, { useMemo } from 'react';

export interface MapCardProps extends React.HTMLAttributes<HTMLDivElement> {
  height?: string | number;
  width?: string | number;
  children?: React.ReactNode;
}

export function MapCard({
  height,
  width,
  children,
  className = '',
  style,
  ...props
}: MapCardProps) {
  const cardStyle = useMemo(
    () => ({
      height:
        height !== undefined
          ? typeof height === 'number'
            ? `${height}px`
            : height
          : undefined,
      width:
        width !== undefined
          ? typeof width === 'number'
            ? `${width}px`
            : width
          : undefined,
      ...style,
    }),
    [height, width, style],
  );

  return (
    <div
      className={`hungpvq-draggable-card ${className}`}
      style={cardStyle}
      {...props}
    >
      <div>{children}</div>
      <div className="card-arrow">
        <div className="card-arrow-top-left"></div>
        <div className="card-arrow-top-right"></div>
        <div className="card-arrow-bottom-left"></div>
        <div className="card-arrow-bottom-right"></div>
      </div>
    </div>
  );
}
