import { useExpand, useShow } from '../../../hook';
import { type LocationSideBar } from '../../../types';
import { useSidebarTransition } from './useSidebarTransition';

export function useSidebarBehavior(
  props: {
    location: LocationSideBar;
  },
  containerId: string,
) {
  const { show, setShow } = useShow(props, null);
  const { expand, toggle } = useExpand(props, null, true);
  const { isVertical, titleTo, contentTo } = useSidebarTransition(
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
    contentTo,
  };
}
