import type { HTMLAttributes, ReactNode } from 'react';

export interface IconProps extends HTMLAttributes<HTMLElement> {
  children?: ReactNode;
}

export function Icon({ children, className = '', ...props }: IconProps) {
  return (
    <i
      className={['ui-icon', 'map-icon', 'mdi', className]
        .filter(Boolean)
        .join(' ')}
      {...props}
    >
      {children}
    </i>
  );
}
