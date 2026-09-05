import { CSSProperties, HTMLAttributes, ReactNode } from 'react';

export interface CustomCardProps extends HTMLAttributes<HTMLDivElement> {
  height?: string | number;
  width?: string | number;
  highlight?: boolean;
  children?: ReactNode;
}

function size(value?: string | number) {
  if (value === undefined) return undefined;
  return typeof value === 'number' ? `${value}px` : value;
}

export function LocalCard({
  height,
  width,
  highlight = false,
  children,
  className = '',
  style,
  ...props
}: CustomCardProps) {
  const cardStyle: CSSProperties = {
    height: size(height),
    width: size(width),
    ...style,
  };
  const classes = [
    'custom-card',
    'custom-card--local',
    highlight ? 'highlight' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={classes} style={cardStyle} {...props}>
      <div className="custom-card__badge">Local</div>
      <div className="custom-card__body">{children}</div>
    </div>
  );
}
