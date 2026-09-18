import { useExpand, useShow } from '../../../hook';
import type { LocationSideBar } from '@hungpvq/draggable';
import { useSidebarTransition } from './useSidebarTransition';

export function useSidebarBehavior(
  props: {
    location: LocationSideBar;
    show?: boolean,
    expand?: boolean
  },
  containerId: string,
) {
  const { show, setShow } = useShow(props);
  const { expand, toggle } = useExpand(props, undefined, true);
  const { isVertical, titleTo, afterTitleTo, contentTo } = useSidebarTransition(
    props,
    containerId,
  );

  return {
    show,
    setShow,
    expand,
    toggleExpand: toggle,
    isVertical,
    titleTo,
    afterTitleTo,
    contentTo,
  };
}
