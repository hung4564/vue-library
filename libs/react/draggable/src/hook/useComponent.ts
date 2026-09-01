import { ComponentType, useMemo } from 'react';
import { MapCard, MapCardProps } from '../components/parts/MapCard';
import { MapHeader, MapHeaderProps } from '../components/parts/MapHeader';
import { useDragComponent } from '../store';

export type ShareCardComponent = ComponentType<MapCardProps>;
export type ShareHeaderComponent = ComponentType<MapHeaderProps>;

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
    () => storeCard || props.componentCard || MapCard,
    [storeCard, props.componentCard],
  );
  const componentCardHeader = useMemo(
    () => storeHeader || props.componentCardHeader || MapHeader,
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
