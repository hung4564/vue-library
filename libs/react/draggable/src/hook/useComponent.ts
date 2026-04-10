import { ComponentType, useMemo } from 'react';
import { MapCard } from '../components/parts/MapCard';
import { MapHeader } from '../components/parts/MapHeader';
import { useDragComponent } from '../store';

export function useComponent(props: {
  componentCard?: ComponentType<any>;
  componentCardHeader?: ComponentType<any>;
  containerId: string;
}) {
  const store = useDragComponent();
  const componentCard = useMemo(
    () => store.getComponentCard() || props.componentCard || MapCard,
    [props.componentCard],
  );
  const componentCardHeader = useMemo(
    () =>
      store.getComponentCardHeader() || props.componentCardHeader || MapHeader,
    [props.componentCardHeader],
  );
  return { componentCard, componentCardHeader };
}

export const withShareComponent = {
  componentCard: { type: [String, Object] },
  componentCardHeader: { type: [String, Object] },
};

export type PropsShareComponent = {
  componentCard?: ComponentType<any>;
  componentCardHeader?: ComponentType<any>;
};
