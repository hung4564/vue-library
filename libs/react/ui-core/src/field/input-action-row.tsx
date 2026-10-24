import type { HTMLAttributes, ReactNode } from 'react';

export interface InputActionRowProps extends HTMLAttributes<HTMLDivElement> {
  /** Field content (typically an Input* that renders `.form-group`). */
  children: ReactNode;
  /** Action control (typically MapControlButton). */
  action: ReactNode;
  /** Drop top margin (e.g. toolbar / find rows). */
  flush?: boolean;
}

/**
 * Joined field + action button row (CreateControl Url|Load pattern).
 */
export function InputActionRow({
  children,
  action,
  flush = false,
  className = '',
  ...rest
}: InputActionRowProps) {
  return (
    <div
      {...rest}
      className={[
        'input-action-row',
        flush ? 'input-action-row--flush' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {children}
      <div className="input-action-row__action">{action}</div>
    </div>
  );
}
