import { ReactNode, useLayoutEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { useSideBarContainer } from '../../../hook/useSideBarContainer';
import { useStoreReactive } from '../../../store';
import { LocationSideBar } from '../../../types';
export interface SidebarModuleProps {
  containerId: string;
  itemId: string;
  location: LocationSideBar;
  title?: ReactNode;
  children?: ReactNode;
}

export function SidebarModule({
  containerId,
  itemId,
  location,
  title,
  children,
}: SidebarModuleProps) {
  useStoreReactive();
  const { getShowForLocation } = useSideBarContainer(containerId);
  const titleTo = useMemo(
    () => `sidebar-title-${containerId}-${location}`,
    [containerId, location],
  );
  const contentTo = useMemo(
    () => `sidebar-content-${containerId}-${location}`,
    [containerId, location],
  );
  const isCurrentShow = useMemo(() => {
    return (
      containerId &&
      itemId &&
      location &&
      itemId === getShowForLocation(location)
    );
  }, [containerId, itemId, location, getShowForLocation]);

  const [portalTargets, setPortalTargets] = useState<{
    title?: HTMLElement;
    content?: HTMLElement;
  }>({});

  useLayoutEffect(() => {
    if (!isCurrentShow) {
      setPortalTargets({});
      return;
    }

    const resolveTargets = () => {
      setPortalTargets({
        title: document.getElementById(titleTo) ?? undefined,
        content: document.getElementById(contentTo) ?? undefined,
      });
    };

    resolveTargets();

    if (
      !document.getElementById(titleTo) ||
      !document.getElementById(contentTo)
    ) {
      const frameId = requestAnimationFrame(resolveTargets);
      return () => cancelAnimationFrame(frameId);
    }
  }, [isCurrentShow, titleTo, contentTo]);

  if (!isCurrentShow) return null;

  return (
    <div className="module-sidebar__container">
      {title &&
        portalTargets.title &&
        createPortal(title, portalTargets.title)}
      {children &&
        portalTargets.content &&
        createPortal(children, portalTargets.content)}
    </div>
  );
}
