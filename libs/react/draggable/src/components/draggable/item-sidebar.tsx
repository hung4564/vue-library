import type { LocationSideBar } from '@hungpvq/draggable';
import { trackLiveEventAction } from '@hungpvq/shared-log';
import { useLiveHookDebug } from '@hungpvq/react-shared-log';
import { type ComponentType, type ReactNode, useMemo } from 'react';

import { useContainerId } from '../../context/ContainerContext';
import {
  ShareCardComponent,
  ShareHeaderComponent,
  useHighlight,
  useInitAction,
  useInitSidebar,
  useShow,
} from '../../hook';
import { DragSidebarToggleProps } from '../parts/DragSidebarToggle';
import { SidebarModule } from './sidebar/sidebar-module';

export interface DraggableItemSideBarProps {
  id?: string;
  show?: boolean;
  /**
   * Plain title for the sidebar switcher menu and default header text
   * (matches Vue `:title`).
   */
  title?: string;
  /**
   * Custom header title node (matches Vue `#title` slot). Falls back to `title`.
   */
  titleNode?: ReactNode;
  /** Immediately to the right of title (header slot contract). */
  afterTitle?: ReactNode;
  containerId?: string;
  componentCard?: ShareCardComponent;
  componentCardHeader?: ShareHeaderComponent;
  componentSidebarToggle?: ComponentType<DragSidebarToggleProps>;
  width?: number | string;
  right?: boolean;
  location?: LocationSideBar;
  onUpdateShow?: (value: boolean) => void;
  onClose?: () => void;
  children?: ReactNode;
}

export function DraggableItemSideBar({
  id: stableId,
  show: propShow,
  title = '',
  titleNode,
  afterTitle,
  containerId: propContainerId,
  right = false,
  location: propLocation,
  onUpdateShow,
  onClose,
  children,
}: DraggableItemSideBarProps) {
  const containerId = useContainerId(propContainerId);
  const liveId = useLiveHookDebug('DraggableItemSideBar');
  const onLog = useMemo(
    () => trackLiveEventAction('DraggableItemSideBar', liveId),
    [liveId],
  );
  const { show, setShow, open, close } = useShow(
    { show: propShow },
    {
      'update:show': onUpdateShow,
      close: onClose,
    },
    undefined,
    onLog,
  );
  const c_location =
    propLocation != null ? propLocation : right ? 'right' : 'left';
  const { location, itemId } = useInitSidebar(
    containerId,
    show,
    setShow,
    {
      title,
      type: 'item-sidebar',
      location: c_location,
    },
    stableId,
  );
  const { isHighlight, setHighLight } = useHighlight();
  useInitAction(containerId, itemId, {
    open,
    close,
    setHighLight,
  });

  return (
    <SidebarModule
      containerId={containerId}
      location={location}
      itemId={itemId}
      title={titleNode ?? title}
      afterTitle={afterTitle}
      highlight={isHighlight}
    >
      {children}
    </SidebarModule>
  );
}
