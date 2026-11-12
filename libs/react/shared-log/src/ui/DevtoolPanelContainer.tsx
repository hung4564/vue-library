import type { HTMLAttributes, ReactNode } from 'react';

export interface DevtoolPanelContainerProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  title?: ReactNode;
  children?: ReactNode;
}

export function DevtoolPanelContainer({
  title,
  children,
  className,
  ...props
}: DevtoolPanelContainerProps) {
  const rootClass = ['devtool-panel', className].filter(Boolean).join(' ');
  return (
    <div
      className={rootClass}
      {...props}
    >
      {title}
      <div className="devtool-panel__body">{children}</div>
    </div>
  );
}

export default DevtoolPanelContainer;
