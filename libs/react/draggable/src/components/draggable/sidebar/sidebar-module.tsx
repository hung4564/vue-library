import { useLayoutEffect, useMemo, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { useSideBarContainer } from '../../../hook/useSideBarContainer';
import { useContainerReactive } from '../../../store/useStoreReactive';
import type { LocationSideBar } from '@hungpvq/draggable';
export interface SidebarModuleProps {
  containerId: string;
  itemId: string;
  location: LocationSideBar;
  title?: ReactNode;
  afterTitle?: ReactNode;
  children?: ReactNode;
}

export function SidebarModule({
  containerId,
  itemId,
  location,
  title,
  afterTitle,
  children,
}: SidebarModuleProps) {
  useContainerReactive(containerId);
  const { getShowForLocation } = useSideBarContainer(containerId);
  const titleTo = useMemo(
    () => `sidebar-title-${containerId}-${location}`,
    [containerId, location],
  );
  const afterTitleTo = useMemo(
    () => `sidebar-after-title-${containerId}-${location}`,
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
    afterTitle?: HTMLElement;
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
        afterTitle: document.getElementById(afterTitleTo) ?? undefined,
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
  }, [isCurrentShow, titleTo, afterTitleTo, contentTo]);

  if (!isCurrentShow) return null;

  return (
    <div className="module-sidebar__container">
      {title &&
        portalTargets.title &&
        createPortal(title, portalTargets.title)}
      {afterTitle &&
        portalTargets.afterTitle &&
        createPortal(afterTitle, portalTargets.afterTitle)}
      {children &&
        portalTargets.content &&
        createPortal(children, portalTargets.content)}
    </div>
  );
}
