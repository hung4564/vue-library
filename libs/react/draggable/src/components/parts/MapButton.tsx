import { ButtonHTMLAttributes, ReactNode } from 'react';
import './MapButton.css';

export interface MapButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  height?: number;
  width?: number;
  disabled?: boolean;
  children?: ReactNode;
}

export function MapButton({
  height = 32,
  width = 32,
  disabled = false,
  children,
  className = '',
  style,
  ...props
}: MapButtonProps) {
  const bindStyle = {
    width: `${width}px`,
    height: `${height}px`,
    ...style,
  };

  const classes = [
    'hungpvq-draggable-button',
    disabled ? 'hungpvq-draggable-button--disabled' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button type="button" className={classes} style={bindStyle} disabled={disabled} {...props}>
      <span className="hungpvq-draggable-button__content">{children}</span>
    </button>
  );
}
