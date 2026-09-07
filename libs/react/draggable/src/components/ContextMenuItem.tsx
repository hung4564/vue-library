import {
  KeyboardEvent as ReactKeyboardEvent,
  MouseEvent as ReactMouseEvent,
  ReactNode,
} from 'react';

export interface ContextMenuItemProps {
  active?: boolean;
  disabled?: boolean;
  className?: string;
  children?: ReactNode;
  onClick?: (event: ReactMouseEvent<HTMLLIElement>) => void;
}

export function ContextMenuItem({
  active = false,
  disabled = false,
  className,
  children,
  onClick,
}: ContextMenuItemProps) {
  function handleKeyDown(event: ReactKeyboardEvent<HTMLLIElement>) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      event.stopPropagation();
      event.currentTarget.click();
    }
  }

  function handleClick(event: ReactMouseEvent<HTMLLIElement>) {
    if (disabled) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }
    onClick?.(event);
  }

  return (
    <li
      role="menuitem"
      tabIndex={-1}
      aria-disabled={disabled || undefined}
      className={[
        'context-menu__item',
        active ? 'is-active' : '',
        disabled ? 'is-disabled' : 'clickable',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
    >
      {children}
    </li>
  );
}
