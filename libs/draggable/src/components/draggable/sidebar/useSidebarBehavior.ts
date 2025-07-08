import { Ref } from 'vue';
import { useExpand, useShow } from '../../../hook';
import { type LocationSideBar } from '../../../types';
import { useSidebarTransition } from './useSidebarTransition';

export function useSidebarBehavior(
  props: {
    location: LocationSideBar;
  },
  containerId: Ref<string>,
) {
  const { show } = useShow(props, null);
  const { expand, toggle } = useExpand(props, null, true);
  const { isVertical, titleTo, contentTo } = useSidebarTransition(
    props,
    containerId,
  );

  return {
    show,
    expand,
    toggleExpand: toggle,
    isVertical,
    titleTo,
    contentTo,
  };
}
