import { ComponentType, ReactNode } from 'react';
import { useContainerId } from '../../context/ContainerContext';
import {
  ShareCardComponent,
  ShareHeaderComponent,
  useInitAction,
  useInitSidebar,
  useShow,
} from '../../hook';
import { LocationSideBar } from '../../types';
import { MapSidebarToggleProps } from '../parts/MapSidebarToggle';
import { SidebarModule } from './sidebar/sidebar-module';

export interface DraggableItemSideBarProps {
  show?: boolean;
  /** Plain title used in sidebar switch menu */
  title?: string;
  /** Custom title node portaled into sidebar header (matches Vue #title slot) */
  titleNode?: ReactNode;
  containerId?: string;
  componentCard?: ShareCardComponent;
  componentCardHeader?: ShareHeaderComponent;
  componentMapSidebarToggle?: ComponentType<MapSidebarToggleProps>;
  width?: number | string;
  right?: boolean;
  location?: LocationSideBar;
  onUpdateShow?: (value: boolean) => void;
  onClose?: () => void;
  children?: ReactNode;
}

export function DraggableItemSideBar({
  show: propShow,
  title = '',
  titleNode,
  containerId: propContainerId,
  right = false,
  location: propLocation,
  onUpdateShow,
  onClose,
  children,
}: DraggableItemSideBarProps) {
  const containerId = useContainerId(propContainerId);
  const { show, setShow, open, close } = useShow(
    { show: propShow },
    {
      'update:show': onUpdateShow,
      close: onClose,
    },
  );
  const c_location =
    propLocation != null ? propLocation : right ? 'right' : 'left';
  const { location, itemId } = useInitSidebar(containerId, show, setShow, {
    title,
    type: 'item-sidebar',
    location: c_location,
  });
  useInitAction(containerId, itemId, {
    open,
    close,
  });

  return (
    <SidebarModule
      containerId={containerId}
      location={location}
      itemId={itemId}
      title={titleNode ?? title}
    >
      {children}
    </SidebarModule>
  );
}
