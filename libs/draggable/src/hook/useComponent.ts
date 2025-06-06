import { computed } from 'vue';

import MapCard from '../components/parts/MapCard.vue';
import MapHeader from '../components/parts/MapHeader.vue';
import { useDragComponent } from '../store';
export function useComponent(props: {
  componentCard?: any;
  componentCardHeader?: any;
  containerId: string;
}) {
  const store = useDragComponent();
  const componentCard = computed(
    () => store.getComponentCard() || props.componentCard || MapCard,
  );
  const componentCardHeader = computed(
    () =>
      store.getComponentCardHeader() || props.componentCardHeader || MapHeader,
  );
  return { componentCard, componentCardHeader };
}

export const withShareComponent = {
  componentCard: { type: [String, Object] },
  componentCardHeader: { type: [String, Object] },
};
