import {
  MouseEvent as ReactMouseEvent,
  ReactNode,
  useCallback,
  useMemo,
  useRef,
} from 'react';
import { useContainerId } from '../../context/ContainerContext';
import {
  ShareCardComponent,
  ShareHeaderComponent,
  useComponent,
  useContainerOrder,
  useExpand,
  useHighlight,
  useIcon,
  useInitAction,
  useInitItem,
  useShow,
} from '../../hook';
import { ContextMenu, type ContextMenuRef } from '../ContextMenu';
import { MapButton } from '../parts/MapButton';

export interface DraggableItemBottomProps {
  show?: boolean;
  expand?: boolean;
  title?: string;
  containerId?: string;
  componentCard?: ShareCardComponent;
  componentCardHeader?: ShareHeaderComponent;
  disabledExpand?: boolean;
  disabledHeader?: boolean;
  disabledClose?: boolean;
  disabledOrder?: boolean;
  onUpdateShow?: (value: boolean) => void;
  onClose?: () => void;
  onUpdateExpand?: (value: boolean) => void;
  children?: ReactNode;
  extraBtn?: ReactNode;
}

export function DraggableItemBottom({
  show: propShow,
  expand: propExpand,
  title = '',
  containerId: propContainerId,
  componentCard,
  componentCardHeader,
  disabledHeader,
  disabledClose,
  disabledOrder,
  onUpdateShow,
  onClose,
  onUpdateExpand,
  children,
  extraBtn,
}: DraggableItemBottomProps) {
  const containerId = useContainerId(propContainerId);
  const { show, setShow, open, close } = useShow(
    { show: propShow },
    {
      'update:show': onUpdateShow,
      close: onClose,
    },
  );
  const { zIndex, itemId } = useInitItem(containerId, show, setShow, {
    title,
    type: 'item-bottom',
  });
  const { isHighlight, setHighLight } = useHighlight();
  useInitAction(containerId, itemId, {
    setHighLight,
    open,
    close,
  });
  const { switchItems, selectItem } = useContainerOrder(containerId, itemId);
  const { expand, toggle: onToggleExpand } = useExpand(
    { expand: propExpand },
    {
      'update:expand': onUpdateExpand,
    },
    false,
  );
  const { componentCard: Card, componentCardHeader: Header } = useComponent({
    componentCard,
    componentCardHeader,
    containerId,
  });

  const { CloseIcon, SidebarOpenMenu, FullscreenIcon, OffFullscreenIcon } =
    useIcon();
  const contextMenuRef = useRef<ContextMenuRef>(null);

  const handleClose = useCallback(() => {
    setShow(false);
  }, [setShow]);

  const openMenu = useCallback((e: ReactMouseEvent) => {
    contextMenuRef.current?.open(e);
  }, []);

  const onSelectItem = useCallback(
    (id: string) => {
      selectItem(id);
      contextMenuRef.current?.close();
    },
    [selectItem],
  );

  const showSwitcher = !disabledOrder && switchItems.length > 1;

  const style = useMemo(() => {
    return {
      zIndex,
      height: expand ? '100%' : '45%',
    };
  }, [zIndex, expand]);

  const menu = (
    <ContextMenu ref={contextMenuRef}>
      <ul className="context-menu">
        {switchItems.map((item) => (
          <li
            key={item.id}
            className={[
              'context-menu__item',
              'clickable',
              item.active ? 'is-active' : '',
            ]
              .filter(Boolean)
              .join(' ')}
            onClick={() => onSelectItem(item.id)}
          >
            <span>{item.title ?? ''}</span>
          </li>
        ))}
      </ul>
    </ContextMenu>
  );

  if (!show) {
    return menu;
  }

  return (
    <>
      <div className="popup-mobile-container" style={style}>
        <Card highlight={isHighlight}>
          <div className="draggable-bottom">
            {!disabledHeader && (
              <Header
                title={title}
                extraBtn={
                  <>
                    {extraBtn}
                    {showSwitcher && (
                      <MapButton
                        onClick={openMenu}
                        aria-label="Open item menu"
                        role="button"
                      >
                        <SidebarOpenMenu size={'16px'} />
                      </MapButton>
                    )}
                    <MapButton onClick={onToggleExpand}>
                      {expand ? (
                        <FullscreenIcon size={'16px'} />
                      ) : (
                        <OffFullscreenIcon size={'16px'} />
                      )}
                    </MapButton>
                    {!disabledClose && (
                      <MapButton onClick={handleClose}>
                        <CloseIcon size={'16px'} />
                      </MapButton>
                    )}
                  </>
                }
              />
            )}
            <div className="draggable-bottom-content">{children}</div>
          </div>
        </Card>
      </div>
      {menu}
    </>
  );
}
