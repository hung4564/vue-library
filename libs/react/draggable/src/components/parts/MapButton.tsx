import type { ButtonHTMLAttributes, ReactNode } from 'react';

export type MapButtonProps = {
  height?: number;
  width?: number;
  disabled?: boolean;
  children?: ReactNode;
} & ButtonHTMLAttributes<HTMLButtonElement>;

function MapButton({
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
    <button
      type="button"
      className={classes}
      style={bindStyle}
      disabled={disabled}
      {...props}
    >
      <span className="hungpvq-draggable-button__content">{children}</span>
    </button>
  );
}

export { MapButton };
