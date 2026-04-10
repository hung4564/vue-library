import { ReactNode, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useSideBarContainer } from '../../../hook/useSideBarContainer';
import { useStoreReactive } from '../../../store';
import { LocationSideBar } from '../../../types';
import './sidebar-module.css';

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
  // Re-render when store changes (e.g. registerSideBarShow) so isCurrentShow is up-to-date
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
      itemId == getShowForLocation(location)
    );
  }, [containerId, itemId, location, getShowForLocation]);

  if (!isCurrentShow) return null;

  const titleElement = document.getElementById(titleTo);
  const contentElement = document.getElementById(contentTo);

  return (
    <div className="module-sidebar__container">
      {title && titleElement && createPortal(title, titleElement)}
      {children && contentElement && createPortal(children, contentElement)}
    </div>
  );
}
