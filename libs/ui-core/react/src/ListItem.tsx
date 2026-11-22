import type { ElementType, HTMLAttributes, KeyboardEvent, MouseEvent, ReactNode } from 'react';

export interface ListItemProps extends Omit<HTMLAttributes<HTMLElement>, 'prefix'> {
  as?: ElementType;
  selected?: boolean;
  disabled?: boolean;
  interactive?: boolean;
  dense?: boolean;
  prefix?: ReactNode;
  suffix?: ReactNode;
  children?: ReactNode;
}

export function ListItem({
  as: Component = 'li',
  selected = false,
  disabled = false,
  interactive = true,
  dense = false,
  prefix,
  suffix,
  className = '',
  children,
  onClick,
  onKeyDown,
  role,
  tabIndex,
  ...rest
}: ListItemProps) {
  const isInteractive = interactive && !disabled;

  const handleClick = (event: MouseEvent<HTMLElement>) => {
    if (disabled) return;
    onClick?.(event);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (disabled) return;
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onClick?.(event as unknown as MouseEvent<HTMLElement>);
    }
    onKeyDown?.(event);
  };

  const classes = [
    'ui-list-item',
    interactive ? 'ui-list-item--interactive' : '',
    selected ? 'ui-list-item--selected' : '',
    disabled ? 'ui-list-item--disabled' : '',
    dense ? 'ui-list-item--dense' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <Component
      {...rest}
      role={role ?? (interactive ? 'button' : 'listitem')}
      tabIndex={tabIndex ?? (isInteractive ? 0 : undefined)}
      aria-selected={selected}
      aria-disabled={disabled}
      className={classes}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
    >
      {prefix ? <div className="ui-list-item__prefix">{prefix}</div> : null}
      <div className="ui-list-item__content">{children}</div>
      {suffix ? <div className="ui-list-item__suffix">{suffix}</div> : null}
    </Component>
  );
}

export default ListItem;
