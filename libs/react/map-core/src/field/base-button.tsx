import React from 'react';

export interface BaseButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean;
  disabled?: boolean;
  children?: React.ReactNode;
}

export function BaseButton({
  active = false,
  disabled = false,
  children,
  className = '',
  ...props
}: BaseButtonProps) {
  const classes = [
    'map-control__button',
    'clickable',
    active ? 'map-control__button-active' : '',
    disabled ? 'map-control__button-disabled' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button type="button" className={classes} {...props}>
      {children}
    </button>
  );
}
