import { computed, type Component } from 'vue';

import MapCard from '../components/parts/MapCard.vue';
import MapHeader from '../components/parts/MapHeader.vue';
import { useDragComponent } from '../store';

export type ShareCardComponent = Component | string;
export type ShareHeaderComponent = Component | string;

export function useComponent(props: {
  componentCard?: ShareCardComponent;
  componentCardHeader?: ShareHeaderComponent;
  containerId: string;
}) {
  const store = useDragComponent();
  const componentCard = computed(
    () => props.componentCard || store.getComponentCard() || MapCard,
  );
  const componentCardHeader = computed(
    () =>
      props.componentCardHeader || store.getComponentCardHeader() || MapHeader,
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
