import type { ElementType, HTMLAttributes, ReactNode } from 'react';

export interface ListProps extends HTMLAttributes<HTMLElement> {
  as?: ElementType;
  dense?: boolean;
  divided?: boolean;
  flush?: boolean;
  children?: ReactNode;
}

export function List({
  as: Component = 'ul',
  dense = false,
  divided = false,
  flush = false,
  className = '',
  children,
  role = 'list',
  ...rest
}: ListProps) {
  const classes = [
    'ui-list',
    dense ? 'ui-list--dense' : '',
    divided ? 'ui-list--divided' : '',
    flush ? 'ui-list--flush' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <Component
      {...rest}
      role={role}
      className={classes}
    >
      {children}
    </Component>
  );
}

export default List;
