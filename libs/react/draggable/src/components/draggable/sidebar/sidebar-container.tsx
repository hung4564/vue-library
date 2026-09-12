import { focusFirst, restoreFocus } from '@hungpvq/draggable';
import {
  type MouseEvent as ReactMouseEvent,
  type ComponentType,
  type CSSProperties,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useContainerId } from '../../../context/ContainerContext';
import { useComponent, useIcon } from '../../../hook';
import { useContainerSize } from '../../../hook/useContainerSize';
import { useSideBarContainer } from '../../../hook/useSideBarContainer';
import {
  useDragComponent,
  useDragContainer,
  useSidebarItem,
} from '../../../store';
import { useContainerReactive } from '../../../store/useStoreReactive';
import { LocationSideBar } from '../../../types';
import { ContextMenu, type ContextMenuRef } from '../../ContextMenu';
import { ContextMenuItem } from '../../ContextMenuItem';
import { DragButton } from '../../parts/DragButton';
import {
  DragSidebarToggle,
  type DragSidebarToggleProps,
} from '../../parts/DragSidebarToggle';
import { useSidebarBehavior } from './useSidebarBehavior';

export interface SidebarContainerProps {
  location: LocationSideBar;
}

export function SidebarContainer({ location }: SidebarContainerProps) {
  const containerId = useContainerId();
  // Subscribe to this container only (not the full drag:core tree)
  useContainerReactive(containerId);
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
  const { getItemAction } = useDragContainer(containerId);
  const store = useDragComponent();
  const ComponentSidebarToggle = (store.getComponentCardSidebarToggle() ||
    DragSidebarToggle) as ComponentType<DragSidebarToggleProps>;

  const { CloseIcon, SidebarOpenMenu } = useIcon();
  const contextMenuRef = useRef<ContextMenuRef>(null);
  const shellRootRef = useRef<HTMLDivElement>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  function openMenu(e: ReactMouseEvent) {
    contextMenuRef.current?.open(e);
  }

  function selectSideBar(itemId: string) {
    storeDragItem.registerSideBarShow(itemId, true);
    contextMenuRef.current?.close();
  }

  function onClose() {
    const itemShow = getShowForLocation(location);
    if (itemShow) {
      const action = getItemAction(itemShow);
      if (action?.close) {
        action.close();
        return;
      }
      storeDragItem.registerSideBarShow(itemShow, false);
    }
    setShow(false);
  }

  useEffect(() => {
    if (!show) {
      restoreFocus(previousFocusRef.current);
      previousFocusRef.current = null;
      return;
    }
    previousFocusRef.current = document.activeElement as HTMLElement | null;
    const focusTimer = window.setTimeout(() => {
      if (shellRootRef.current) focusFirst(shellRootRef.current);
    }, 0);
    function onKeydown(event: KeyboardEvent) {
      if (event.key !== 'Escape') return;
      if (menuOpen) return;
      const root = shellRootRef.current;
      if (!root) return;
      const target = event.target as Node | null;
      if (target && !root.contains(target) && document.activeElement !== root) {
        return;
      }
      event.preventDefault();
      onClose();
    }
    document.addEventListener('keydown', onKeydown);
    return () => {
      window.clearTimeout(focusTimer);
      document.removeEventListener('keydown', onKeydown);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- onClose closes via location/store
  }, [show, menuOpen, location]);

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
  const activeSidebarId = useMemo(
    () => getShowForLocation(location),
    [getShowForLocation, location],
  );
  const showSwitcher = allItems.length > 1;

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
        ref={shellRootRef}
        className={classes}
        role="complementary"
        aria-label={`Sidebar ${location}`}
        aria-labelledby={titleTo}
        tabIndex={-1}
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
                    {showSwitcher && (
                      <DragButton
                        onClick={openMenu}
                        aria-label="Open sidebar menu"
                        aria-haspopup="menu"
                        aria-expanded={menuOpen}
                      >
                        <SidebarOpenMenu size={'16px'} />
                      </DragButton>
                    )}
                    <DragButton onClick={onClose} aria-label="Close sidebar">
                      <CloseIcon size={'16px'} />
                    </DragButton>
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
            <ComponentSidebarToggle
              onClick={onToggleExpand}
              expand={expand}
              aria-controls={contentTo}
              aria-expanded={expand}
              aria-label={expand ? 'Collapse sidebar' : 'Expand sidebar'}
            />
          </div>
        )}
      </div>
      <ContextMenu
        ref={contextMenuRef}
        ariaLabel="Switch sidebar panel"
        onOpenChange={setMenuOpen}
      >
        <ul className="context-menu" role="presentation">
          {allItems.map((item) => (
            <ContextMenuItem
              key={item.id}
              active={item.id === activeSidebarId}
              onClick={() => selectSideBar(item.id)}
            >
              <span>{item.title ?? ''}</span>
            </ContextMenuItem>
          ))}
        </ul>
      </ContextMenu>
    </>
  );
}
