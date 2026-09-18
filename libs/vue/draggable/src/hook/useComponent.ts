import { computed, type Component } from 'vue';

import DragCard from '../components/parts/DragCard.vue';
import DragHeader from '../components/parts/DragHeader.vue';
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
    () => props.componentCard || store.getComponentCard() || DragCard,
  );
  const componentCardHeader = computed(
    () =>
      props.componentCardHeader || store.getComponentCardHeader() || DragHeader,
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
