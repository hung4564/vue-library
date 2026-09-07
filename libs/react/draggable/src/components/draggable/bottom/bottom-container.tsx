import {
  type MouseEvent as ReactMouseEvent,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useContainerId } from '../../../context/ContainerContext';
import { useComponent, useExpand, useIcon } from '../../../hook';
import { useBottomContainer } from '../../../hook/useBottomContainer';
import { useBottomItem } from '../../../store';
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

  const { expand, toggle: onToggleExpand } = useExpand({}, undefined, false);
  const { componentCard: Card, componentCardHeader: Header } = useComponent({
    containerId,
  });
  const { CloseIcon, SidebarOpenMenu, FullscreenIcon, OffFullscreenIcon } =
    useIcon();
  const contextMenuRef = useRef<ContextMenuRef>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  const activeBottomId = getShow();
  // Derive visibility in render (not useEffect) so portal hosts exist in the
  // same commit that BottomModule looks them up.
  const visible = !!activeBottomId;
  const allItems = getItems();
  const showSwitcher = allItems.length > 1;

  function onClose() {
    const itemShow = getShow();
    if (itemShow) storeBottomRef.current.registerBottomShow(itemShow, false);
  }

  function openMenu(e: ReactMouseEvent) {
    contextMenuRef.current?.open(e);
  }

  function selectBottom(nextId: string) {
    storeBottomRef.current.registerBottomShow(nextId, true);
    contextMenuRef.current?.close();
  }

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
        className="popup-mobile-container bottom-container"
        style={shellStyle}
        role="region"
        aria-label="Bottom panel"
        aria-labelledby={titleTo}
        aria-hidden={!visible}
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
                      role="button"
                    >
                      <SidebarOpenMenu size={'16px'} />
                    </MapButton>
                  )}
                  <MapButton
                    onClick={onToggleExpand}
                    aria-label={
                      expand ? 'Collapse bottom panel' : 'Expand bottom panel'
                    }
                    role="button"
                  >
                    {expand ? (
                      <FullscreenIcon size={'16px'} />
                    ) : (
                      <OffFullscreenIcon size={'16px'} />
                    )}
                  </MapButton>
                  <MapButton
                    onClick={onClose}
                    aria-label="Close bottom"
                    role="button"
                  >
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
        <ul className="context-menu">
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
