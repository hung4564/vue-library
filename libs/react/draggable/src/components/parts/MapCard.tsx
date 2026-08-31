import { HTMLAttributes, ReactNode, useMemo } from 'react';
export interface MapCardProps extends HTMLAttributes<HTMLDivElement> {
  height?: string | number;
  width?: string | number;
  highlight?: boolean;
  children?: ReactNode;
}

export function MapCard({
  height,
  width,
  highlight = false,
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

  const classes = [
    'hungpvq-draggable-card',
    highlight ? 'highlight' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={classes} style={cardStyle} {...props}>
      <div className="card-container">{children}</div>
      <div className="card-arrow">
        <div className="card-arrow-top-left"></div>
        <div className="card-arrow-top-right"></div>
        <div className="card-arrow-bottom-left"></div>
        <div className="card-arrow-bottom-right"></div>
      </div>
    </div>
  );
}
