import type { LocationSideBar } from '@hungpvq/draggable';
import { useMemo } from 'react';

export function useSidebarTransition(
  props: { location: LocationSideBar },
  containerId: string,
) {
  const isVertical = useMemo(
    () => props.location === 'top' || props.location === 'bottom',
    [props.location],
  );
  const titleTo = useMemo(
    () => `sidebar-title-${containerId}-${props.location}`,
    [containerId, props.location],
  );
  const afterTitleTo = useMemo(
    () => `sidebar-after-title-${containerId}-${props.location}`,
    [containerId, props.location],
  );
  const contentTo = useMemo(
    () => `sidebar-content-${containerId}-${props.location}`,
    [containerId, props.location],
  );
  return { isVertical, titleTo, afterTitleTo, contentTo };
}
