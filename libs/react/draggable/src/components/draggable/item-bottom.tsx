import { ComponentType, ReactNode, useMemo } from 'react';
import { useContainerId } from '../../context/ContainerContext';
import {
  useComponent,
  useContainerOrder,
  useExpand,
  useHighlight,
  useIcon,
  useInitAction,
  useInitItem,
  useShow,
} from '../../hook';
import { MapButton } from '../parts/MapButton';
import './item-bottom.css';

export interface DraggableItemBottomProps {
  show?: boolean;
  expand?: boolean;
  title?: string;
  containerId?: string;
  componentCard?: ComponentType<any>;
  componentCardHeader?: ComponentType<any>;
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
  disabledExpand,
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
  const { isFirst, isHasItems, onToBack } = useContainerOrder(
    containerId,
    itemId,
  );
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

  const { CloseIcon, ToBackIcon, FullscreenIcon, OffFullscreenIcon } =
    useIcon();

  function handleClose() {
    setShow(false);
  }

  const style = useMemo(() => {
    return {
      zIndex,
      height: expand ? '100%' : '45%',
    };
  }, [zIndex, expand]);

  if (!show) return null;

  return (
    <div className="popup-mobile-container" style={style}>
      <Card highlight={isHighlight}>
        <div className="draggable-bottom">
          {!disabledHeader && (
            <Header
              title={title}
              extraBtn={
                <>
                  {extraBtn}
                  {isHasItems && !disabledOrder && (
                    <MapButton disabled={isFirst} onClick={onToBack}>
                      <ToBackIcon size={'16px'} />
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
  );
}
