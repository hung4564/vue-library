import type { HTMLAttributes, ReactNode } from 'react';

export interface DevtoolPanelToolbarProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  title?: ReactNode;
  actions?: ReactNode;
  children?: ReactNode;
}

export function DevtoolPanelToolbar({
  title,
  actions,
  children,
  className,
  ...props
}: DevtoolPanelToolbarProps) {
  const rootClass = ['devtool-panel__toolbar', className]
    .filter(Boolean)
    .join(' ');
  return (
    <div
      className={rootClass}
      {...props}
    >
      <span className="devtool-panel__title">{title}</span>
      {children}
      <div className="devtool-panel__actions">{actions}</div>
    </div>
  );
}

export default DevtoolPanelToolbar;
