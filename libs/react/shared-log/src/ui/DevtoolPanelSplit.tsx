import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';

export interface DevtoolPanelSplitProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
}

export const DevtoolPanelSplit = forwardRef<
  HTMLDivElement,
  DevtoolPanelSplitProps
>(function DevtoolPanelSplit({ children, className, ...props }, ref) {
  const rootClass = ['devtool-panel__split', className]
    .filter(Boolean)
    .join(' ');

  return (
    <div
      ref={ref}
      className={rootClass}
      {...props}
    >
      {children}
    </div>
  );
});

export default DevtoolPanelSplit;
