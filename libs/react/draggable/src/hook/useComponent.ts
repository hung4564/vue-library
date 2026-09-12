import { useMemo, type ComponentType } from 'react';
import { DragCard } from '../components/parts/DragCard';
import type { DragCardProps } from '../components/parts/DragCard';
import { DragHeader } from '../components/parts/DragHeader';
import type { DragHeaderProps } from '../components/parts/DragHeader';
import { useDragComponent } from '../store';

export type ShareCardComponent = ComponentType<DragCardProps>;
export type ShareHeaderComponent = ComponentType<DragHeaderProps>;

export function useComponent(props: {
  componentCard?: ShareCardComponent;
  componentCardHeader?: ShareHeaderComponent;
  containerId: string;
}) {
  const store = useDragComponent();
  const storeCard = store.getComponentCard() as ShareCardComponent | undefined;
  const storeHeader = store.getComponentCardHeader() as
    | ShareHeaderComponent
    | undefined;
  const componentCard = useMemo(
    () => props.componentCard || storeCard || DragCard,
    [storeCard, props.componentCard],
  );
  const componentCardHeader = useMemo(
    () => props.componentCardHeader || storeHeader || DragHeader,
    [storeHeader, props.componentCardHeader],
  );
  return { componentCard, componentCardHeader };
}

export const withShareComponent = {
  componentCard: { type: [String, Object] },
  componentCardHeader: { type: [String, Object] },
};

export type PropsShareComponent = {
  componentCard?: ShareCardComponent;
  componentCardHeader?: ShareHeaderComponent;
};
