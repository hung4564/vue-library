import { computed } from 'vue';

import MapCard from '../components/parts/MapCard.vue';
import MapHeader from '../components/parts/MapHeader.vue';
import { store } from '../store/store';
export function useComponent(props: {
  componentCard?: any;
  componentCardHeader?: any;
  containerId: string;
}) {
  const componentCard = computed(
    () =>
      store.getters.getComponentCard(props.containerId) ||
      props.componentCard ||
      MapCard
  );
  const componentCardHeader = computed(
    () =>
      store.getters.getComponentCardHeader(props.containerId) ||
      props.componentCardHeader ||
      MapHeader
  );
  return { componentCard, componentCardHeader };
}

export const withShareComponent = {
  componentCard: { type: [String, Object] },
  componentCardHeader: { type: [String, Object] },
};
