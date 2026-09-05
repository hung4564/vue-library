import {
  MouseEvent as ReactMouseEvent,
  ReactNode,
  TouchEvent as ReactTouchEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { createPortal } from 'react-dom';
import { useContainerId } from '../../context/ContainerContext';
import {
  ShareCardComponent,
  ShareHeaderComponent,
  useComponent,
  useHighlight,
  useIcon,
  useInitAction,
  useInitDrawer,
  useShow,
} from '../../hook';
import { useContainerSize } from '../../hook/useContainerSize';
import { useDrawerItem, useStoreReactive } from '../../store';
import { LocationSideBar } from '../../types';
import { ContextMenu, type ContextMenuRef } from '../ContextMenu';
import { MapButton } from '../parts/MapButton';

export interface DraggableDrawerProps {
  show?: boolean;
  title?: string;
  containerId?: string;
  componentCard?: ShareCardComponent;
  componentCardHeader?: ShareHeaderComponent;
  disabledHeader?: boolean;
  disabledClose?: boolean;
  location?: LocationSideBar;
  size?: number;
  minSize?: number;
  maxSize?: number;
  resizable?: boolean;
  onUpdateShow?: (value: boolean) => void;
  onClose?: () => void;
  onUpdateSize?: (value: number) => void;
  onResize?: (value: number) => void;
  children?: ReactNode;
  extraBtn?: ReactNode;
}

export function DraggableDrawer({
  show: propShow,
  title = '',
  containerId: propContainerId,
  componentCard,
  componentCardHeader,
  disabledHeader,
  disabledClose,
  location = 'right',
  size: propSize = 360,
  minSize = 200,
  maxSize,
  resizable = true,
  onUpdateShow,
  onClose,
  onUpdateSize,
  onResize,
  children,
  extraBtn,
}: DraggableDrawerProps) {
  const containerId = useContainerId(propContainerId);
  useStoreReactive();
  const { show, setShow, open, close } = useShow(
    { show: propShow },
    {
      'update:show': onUpdateShow,
      close: onClose,
    },
  );
  const { itemId } = useInitDrawer(containerId, setShow, {
    title,
    type: 'item-drawer',
    location,
  });
  const { isHighlight, setHighLight } = useHighlight();
  useInitAction(containerId, itemId, {
    setHighLight,
    open,
    close,
  });
  const drawerStore = useDrawerItem(containerId);
  const drawerStoreRef = useRef(drawerStore);
  drawerStoreRef.current = drawerStore;
  const { containerWidth, containerHeight } = useContainerSize(containerId);
  const { componentCard: Card, componentCardHeader: Header } = useComponent({
    componentCard,
    componentCardHeader,
    containerId,
  });

  const { CloseIcon, SidebarOpenMenu } = useIcon();
  const contextMenuRef = useRef<ContextMenuRef>(null);

  const isHorizontal = location === 'left' || location === 'right';
  const [p_size, setPSize] = useState(propSize);
  const [isResizing, setIsResizing] = useState(false);
  const [slotEl, setSlotEl] = useState<HTMLElement | null>(null);
  const resizeState = useRef({ startPos: 0, startSize: 0 });
  const listenersRef = useRef<{
    move: (event: MouseEvent | TouchEvent) => void;
    end: () => void;
  } | null>(null);
  const prevLocationRef = useRef(location);

  const drawerItems = useMemo(
    () => drawerStore.getItemsForLocation(location),
    [drawerStore, location],
  );
  const activeDrawerId = useMemo(
    () => drawerStore.getShowForLocation(location),
    [drawerStore, location],
  );
  const showSwitcher = drawerItems.length > 1;

  const clampSize = useCallback(
    (value: number) => {
      const centerSize = isHorizontal ? containerWidth : containerHeight;
      const available = (centerSize || 0) + p_size;
      let next = value;
      if (maxSize != null) {
        next = Math.min(next, maxSize);
      }
      if (available > 0) {
        next = Math.min(next, Math.max(minSize, available - 80));
      }
      return Math.max(minSize, next);
    },
    [containerHeight, containerWidth, isHorizontal, maxSize, minSize, p_size],
  );

  useEffect(() => {
    setPSize((current) => {
      const next = clampSize(propSize);
      return next === current ? current : next;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentional: prop-driven sync only
  }, [propSize]);

  const setSize = useCallback(
    (value: number) => {
      const next = clampSize(value);
      setPSize(next);
      if (show) {
        drawerStoreRef.current.setDrawerSize(location, next);
      }
      onUpdateSize?.(next);
      onResize?.(next);
    },
    [clampSize, location, onResize, onUpdateSize, show],
  );

  useEffect(() => {
    const prev = prevLocationRef.current;
    if (prev !== location) {
      drawerStoreRef.current.moveDrawerLocation(itemId, location);
      prevLocationRef.current = location;
    }
    drawerStoreRef.current.registerDrawerShow(
      itemId,
      location,
      show,
      show ? p_size : undefined,
    );
  }, [itemId, location, show, p_size]);

  useEffect(() => {
    const syncSlot = () => {
      setSlotEl(document.getElementById(`drawer-${location}-${containerId}`));
    };
    syncSlot();
    const timer = window.setInterval(syncSlot, 100);
    return () => window.clearInterval(timer);
  }, [containerId, location]);

  const handleClose = useCallback(() => {
    setShow(false);
  }, [setShow]);

  const openMenu = useCallback((e: ReactMouseEvent) => {
    contextMenuRef.current?.open(e);
  }, []);

  const selectDrawer = useCallback(
    (nextId: string) => {
      drawerStoreRef.current.registerDrawerShow(
        nextId,
        location,
        true,
        p_size,
      );
      contextMenuRef.current?.close();
    },
    [location, p_size],
  );

  const detachResizeListeners = useCallback(() => {
    if (!listenersRef.current) return;
    window.removeEventListener('mousemove', listenersRef.current.move);
    window.removeEventListener('mouseup', listenersRef.current.end);
    window.removeEventListener('touchmove', listenersRef.current.move);
    window.removeEventListener('touchend', listenersRef.current.end);
    listenersRef.current = null;
  }, []);

  const onResizeStart = useCallback(
    (event: ReactMouseEvent | ReactTouchEvent) => {
      if (!resizable) return;
      event.preventDefault();
      setIsResizing(true);
      resizeState.current.startSize = p_size;
      if ('touches' in event) {
        resizeState.current.startPos = isHorizontal
          ? event.touches[0].clientX
          : event.touches[0].clientY;
      } else {
        resizeState.current.startPos = isHorizontal
          ? event.clientX
          : event.clientY;
      }

      const onResizeMove = (moveEvent: MouseEvent | TouchEvent) => {
        moveEvent.preventDefault();
        let current = 0;
        if ('touches' in moveEvent) {
          current = isHorizontal
            ? moveEvent.touches[0].clientX
            : moveEvent.touches[0].clientY;
        } else {
          current = isHorizontal ? moveEvent.clientX : moveEvent.clientY;
        }
        const delta = current - resizeState.current.startPos;
        let next = resizeState.current.startSize;
        switch (location) {
          case 'left':
            next = resizeState.current.startSize + delta;
            break;
          case 'right':
            next = resizeState.current.startSize - delta;
            break;
          case 'top':
            next = resizeState.current.startSize + delta;
            break;
          case 'bottom':
            next = resizeState.current.startSize - delta;
            break;
        }
        setSize(next);
      };

      const onResizeEnd = () => {
        setIsResizing(false);
        detachResizeListeners();
      };

      listenersRef.current = { move: onResizeMove, end: onResizeEnd };
      window.addEventListener('mousemove', onResizeMove);
      window.addEventListener('mouseup', onResizeEnd);
      window.addEventListener('touchmove', onResizeMove, { passive: false });
      window.addEventListener('touchend', onResizeEnd);
    },
    [detachResizeListeners, isHorizontal, location, p_size, resizable, setSize],
  );

  useEffect(() => {
    return () => {
      detachResizeListeners();
    };
  }, [detachResizeListeners]);

  const resizeHandleClass = useMemo(() => {
    return [
      'draggable-drawer-resize',
      `draggable-drawer-resize--${location}`,
      isResizing ? 'is-resizing' : '',
    ]
      .filter(Boolean)
      .join(' ');
  }, [isResizing, location]);

  const menu = (
    <ContextMenu ref={contextMenuRef}>
      <ul className="context-menu">
        {drawerItems.map((item) => (
          <li
            key={item.id}
            className={[
              'context-menu__item',
              'clickable',
              item.id === activeDrawerId ? 'is-active' : '',
            ]
              .filter(Boolean)
              .join(' ')}
            onClick={() => selectDrawer(item.id)}
          >
            <span>{item.title ?? ''}</span>
          </li>
        ))}
      </ul>
    </ContextMenu>
  );

  if (!show || !slotEl) {
    return menu;
  }

  return (
    <>
      {createPortal(
        <div
          className={[
            'draggable-drawer',
            `draggable-drawer--${location}`,
            isResizing ? 'draggable-drawer--resizing' : '',
          ]
            .filter(Boolean)
            .join(' ')}
        >
          <Card highlight={isHighlight}>
            <div className="draggable-drawer-inner">
              {!disabledHeader && (
                <Header
                  title={title}
                  extraBtn={
                    <>
                      {extraBtn}
                      {showSwitcher && (
                        <MapButton
                          onClick={openMenu}
                          aria-label="Open drawer menu"
                          role="button"
                        >
                          <SidebarOpenMenu size={'16px'} />
                        </MapButton>
                      )}
                      {!disabledClose && (
                        <MapButton onClick={handleClose}>
                          <CloseIcon size={'16px'} />
                        </MapButton>
                      )}
                    </>
                  }
                />
              )}
              <div className="draggable-drawer-content">{children}</div>
            </div>
          </Card>
          {resizable && (
            <div
              className={resizeHandleClass}
              onMouseDown={onResizeStart}
              onTouchStart={onResizeStart}
            />
          )}
        </div>,
        slotEl,
      )}
      {menu}
    </>
  );
}
