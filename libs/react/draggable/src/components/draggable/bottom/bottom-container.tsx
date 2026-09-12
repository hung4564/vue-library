import { focusFirst, restoreFocus } from '@hungpvq/draggable';
import {
  type MouseEvent as ReactMouseEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useContainerId } from '../../../context/ContainerContext';
import { useComponent, useExpand, useIcon } from '../../../hook';
import { useBottomContainer } from '../../../hook/useBottomContainer';
import { useBottomItem, useDragContainer } from '../../../store';
import { useStoreReactive } from '../../../store/useStoreReactive';
import { ContextMenu, type ContextMenuRef } from '../../ContextMenu';
import { ContextMenuItem } from '../../ContextMenuItem';
import { MapButton } from '../../parts/MapButton';

export function BottomContainer() {
  const containerId = useContainerId();
  useStoreReactive();
  const { getShow, getItems } = useBottomContainer(containerId);
  const storeBottom = useBottomItem(containerId);
  const storeBottomRef = useRef(storeBottom);
  storeBottomRef.current = storeBottom;
  const { getItemAction } = useDragContainer(containerId);

  const { expand, toggle: onToggleExpand } = useExpand({}, undefined, false);
  const { componentCard: Card, componentCardHeader: Header } = useComponent({
    containerId,
  });
  const { CloseIcon, SidebarOpenMenu, FullscreenIcon, OffFullscreenIcon } =
    useIcon();
  const contextMenuRef = useRef<ContextMenuRef>(null);
  const shellRootRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  const activeBottomId = getShow();
  // Derive visibility in render (not useEffect) so portal hosts exist in the
  // same commit that BottomModule looks them up.
  const visible = !!activeBottomId;
  const allItems = getItems();
  const showSwitcher = allItems.length > 1;

  function onClose() {
    const itemShow = getShow();
    if (itemShow) {
      const action = getItemAction(itemShow);
      if (action?.close) {
        action.close();
        return;
      }
      storeBottomRef.current.registerBottomShow(itemShow, false);
    }
  }

  function openMenu(e: ReactMouseEvent) {
    contextMenuRef.current?.open(e);
  }

  function selectBottom(nextId: string) {
    storeBottomRef.current.registerBottomShow(nextId, true);
    contextMenuRef.current?.close();
  }

  useEffect(() => {
    if (!visible) {
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
    // eslint-disable-next-line react-hooks/exhaustive-deps -- close via store
  }, [visible, menuOpen, containerId]);

  const titleTo = `bottom-title-${containerId}`;
  const contentTo = `bottom-content-${containerId}`;
  const shellStyle = useMemo(
    () => ({
      height: expand ? '100%' : '45%',
      // Always mount hosts (like sidebar); hide when no active bottom.
      display: visible ? undefined : 'none',
    }),
    [expand, visible],
  );

  return (
    <>
      <div
        ref={shellRootRef}
        className="popup-mobile-container bottom-container"
        style={shellStyle}
        role="region"
        aria-label="Bottom panel"
        aria-labelledby={titleTo}
        aria-hidden={!visible}
        tabIndex={-1}
      >
        <Card>
          <div className="draggable-bottom">
            <Header
              title={<span id={titleTo} />}
              extraBtn={
                <>
                  {showSwitcher && (
                    <MapButton
                      onClick={openMenu}
                      aria-label="Open bottom menu"
                      aria-haspopup="menu"
                      aria-expanded={menuOpen}
                    >
                      <SidebarOpenMenu size={'16px'} />
                    </MapButton>
                  )}
                  <MapButton
                    onClick={onToggleExpand}
                    aria-label={
                      expand ? 'Collapse bottom panel' : 'Expand bottom panel'
                    }
                    aria-expanded={expand}
                    aria-controls={contentTo}
                  >
                    {expand ? (
                      <FullscreenIcon size={'16px'} />
                    ) : (
                      <OffFullscreenIcon size={'16px'} />
                    )}
                  </MapButton>
                  <MapButton onClick={onClose} aria-label="Close bottom">
                    <CloseIcon size={'16px'} />
                  </MapButton>
                </>
              }
            />
            <div className="draggable-bottom-content" id={contentTo} />
          </div>
        </Card>
      </div>
      <ContextMenu
        ref={contextMenuRef}
        ariaLabel="Switch bottom panel"
        onOpenChange={setMenuOpen}
      >
        <ul className="context-menu" role="presentation">
          {allItems.map((item) => (
            <ContextMenuItem
              key={item.id}
              active={item.id === activeBottomId}
              onClick={() => selectBottom(item.id)}
            >
              <span>{item.title ?? ''}</span>
            </ContextMenuItem>
          ))}
        </ul>
      </ContextMenu>
    </>
  );
}
