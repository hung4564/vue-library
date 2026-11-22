import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';

export interface DevtoolPanelCardProps extends HTMLAttributes<HTMLElement> {
  as?: 'div' | 'aside' | 'section';
  flush?: boolean;
  children?: ReactNode;
}

export const DevtoolPanelCard = forwardRef<HTMLElement, DevtoolPanelCardProps>(
  function DevtoolPanelCard(
    { as: Component = 'div', flush = false, children, className, ...props },
    ref,
  ) {
    const rootClass = [
      'devtool-panel__card',
      flush ? 'devtool-panel__card--flush' : '',
      className,
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <Component
        ref={ref as any}
        className={rootClass}
        {...(props as HTMLAttributes<HTMLDivElement>)}
      >
        {children}
      </Component>
    );
  },
);

export default DevtoolPanelCard;
