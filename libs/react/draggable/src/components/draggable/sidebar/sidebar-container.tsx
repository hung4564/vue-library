import {
  type MouseEvent as ReactMouseEvent,
  CSSProperties,
  useEffect,
  useMemo,
  useRef,
} from 'react';
import { useContainerId } from '../../../context/ContainerContext';
import { useComponent, useIcon } from '../../../hook';
import { useContainerSize } from '../../../hook/useContainerSize';
import { useSideBarContainer } from '../../../hook/useSideBarContainer';
import {
  useDragComponent,
  useSidebarItem,
  useStoreReactive,
} from '../../../store';
import { LocationSideBar } from '../../../types';
import { ContextMenu, type ContextMenuRef } from '../../ContextMenu';
import { MapButton } from '../../parts/MapButton';
import { MapSidebarToggle } from '../../parts/MapSidebarToggle';
import { useSidebarBehavior } from './useSidebarBehavior';

export interface SidebarContainerProps {
  location: LocationSideBar;
}

export function SidebarContainer({ location }: SidebarContainerProps) {
  const containerId = useContainerId();
  // Subscribe to store changes so we re-render when DraggableItemSideBar registers
  useStoreReactive();
  const { containerWidth, containerHeight } = useContainerSize(containerId);
  const sidebarWidth = useMemo(() => {
    if (containerWidth <= 600) return '100%';
    if (containerWidth <= 1264) return '320px';
    return '400px';
  }, [containerWidth]);
  const sidebarHeight = useMemo(() => {
    const h = containerHeight;
    if (h <= 400) return '100%';
    if (h <= 800) return '40%';
    if (h <= 1080) return '320px';
    return '400px';
  }, [containerHeight]);
  const { getShowForLocation, getItemsForLocation } =
    useSideBarContainer(containerId);
  const {
    show,
    setShow,
    expand,
    toggleExpand: onToggleExpand,
    isVertical,
    titleTo,
    contentTo,
  } = useSidebarBehavior({ location }, containerId);
  const { componentCard: Card, componentCardHeader: Header } = useComponent({
    containerId,
  });
  const storeDragItem = useSidebarItem(containerId);
  const store = useDragComponent();
  const ComponentMapSidebarToggle =
    store.getComponentCardSidebarToggle() || MapSidebarToggle;

  const { CloseIcon, SidebarOpenMenu } = useIcon();
  const contextMenuRef = useRef<ContextMenuRef>(null);

  function openMenu(e: ReactMouseEvent) {
    contextMenuRef.current?.open(e);
  }

  function selectSideBar(itemId: string) {
    storeDragItem.registerSideBarShow(itemId, true);
    contextMenuRef.current?.close();
  }

  function onClose() {
    setShow(false);
    const itemShow = getShowForLocation(location);
    if (itemShow) storeDragItem.registerSideBarShow(itemShow, false);
  }

  const c_getShowForLocation = useMemo(
    () => getShowForLocation(location),
    [getShowForLocation, location],
  );

  useEffect(() => {
    setShow(!!c_getShowForLocation);
  }, [c_getShowForLocation, setShow]);

  const allItems = useMemo(
    () => getItemsForLocation(location),
    [getItemsForLocation, location],
  );
  const availableSidebarItems = useMemo(
    () => allItems.filter((x) => x.id !== getShowForLocation(location)),
    [allItems, getShowForLocation, location],
  );

  const classes = [
    'sidebar-container',
    'auto-sidebar-container',
    expand ? 'expand' : '',
    show ? 'show' : '',
    !isVertical ? 'sidebar-horizontal-container' : '',
    isVertical ? 'sidebar-vertical-container' : '',
    `${location}-sidebar-container`,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <>
      <div
        className={classes}
        style={
          {
            '--sidebar-width': sidebarWidth,
            '--sidebar-height': sidebarHeight,
          } as CSSProperties
        }
      >
        <div className="sidebar-container--content">
          <Card width="100%" height="100%">
            <div className="draggable-sidebar">
              <Header
                title={
                  <div id={titleTo}>{/* Title will be portaled here */}</div>
                }
                extraBtn={
                  <>
                    {availableSidebarItems.length > 0 && (
                      <MapButton
                        onClick={openMenu}
                        aria-label="Open sidebar menu"
                        role="button"
                      >
                        <SidebarOpenMenu size={'16px'} />
                      </MapButton>
                    )}
                    <MapButton
                      onClick={onClose}
                      aria-label="Close sidebar"
                      role="button"
                    >
                      <CloseIcon size={'16px'} />
                    </MapButton>
                  </>
                }
              />
              <div className="draggable-sidebar-content" id={contentTo}>
                {/* Content will be portaled here */}
              </div>
            </div>
          </Card>
        </div>
        {show && (
          <div className="complex-button-close">
            <ComponentMapSidebarToggle
              onClick={onToggleExpand}
              expand={expand}
              aria-controls={contentTo}
              aria-label="Toggle expand"
              role="button"
            />
          </div>
        )}
      </div>
      <ContextMenu ref={contextMenuRef}>
        <ul className="context-menu">
          {availableSidebarItems.map((item) => (
            <li
              key={item.id}
              className="context-menu__item clickable"
              onClick={() => selectSideBar(item.id)}
            >
              <span>{item.title ?? ''}</span>
            </li>
          ))}
        </ul>
      </ContextMenu>
    </>
  );
}
