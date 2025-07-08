import { computed, Ref } from 'vue';
import { LocationSideBar } from '../../..//types';

export function useSidebarTransition(
  props: { location: LocationSideBar },
  containerId: Ref<string>,
) {
  const isVertical = computed(
    () => props.location === 'top' || props.location === 'bottom',
  );
  const titleTo = computed(
    () => `sidebar-title-${containerId.value}-${props.location}`,
  );
  const contentTo = computed(
    () => `sidebar-content-${containerId.value}-${props.location}`,
  );
  return { isVertical, titleTo, contentTo };
}
