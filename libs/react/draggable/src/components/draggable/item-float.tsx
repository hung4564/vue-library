import { ComponentType, CSSProperties, ReactNode, useMemo } from 'react';
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
export interface DraggableItemFloatProps {
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
  top?: number;
  left?: number;
  bottom?: number;
  right?: number;
  width?: number | string;
  maxHeight?: number;
  headerLocation?: 'top' | 'bottom';
  onUpdateShow?: (value: boolean) => void;
  onClose?: () => void;
  onUpdateExpand?: (value: boolean) => void;
  children?: ReactNode;
  extraBtn?: ReactNode;
}

export function DraggableItemFloat({
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
  top,
  left,
  bottom,
  right,
  width = 'auto',
  maxHeight = 500,
  headerLocation = 'top',
  onUpdateShow,
  onClose,
  onUpdateExpand,
  children,
  extraBtn,
}: DraggableItemFloatProps) {
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
    type: 'item-float',
  });
  const { isHighlight, setHighLight } = useHighlight();
  useInitAction(containerId, itemId, {
    setHighLight,
    open,
    close,
  });
  const { isLast, isFirst, isHasItems, onToBack, onToFront } =
    useContainerOrder(containerId, itemId);
  const { expand, toggle: onToggleExpand } = useExpand(
    { expand: propExpand },
    {
      'update:expand': onUpdateExpand,
    },
    true,
  );
  const { componentCard: Card, componentCardHeader: Header } = useComponent({
    componentCard,
    componentCardHeader,
    containerId,
  });

  const {
    CloseIcon,
    ToBackIcon,
    ToFrontIcon,
    ExpandedIcon,
    CloseExpandedIcon,
  } = useIcon();

  function handleClose() {
    setShow(false);
  }

  const style = useMemo(() => {
    const s: CSSProperties = { zIndex };
    if (top !== undefined) s.top = `${top}px`;
    if (left !== undefined) s.left = `${left}px`;
    if (right !== undefined) s.right = `${right}px`;
    if (bottom !== undefined) s.bottom = `${bottom}px`;
    if (width && width !== 'auto') {
      if (typeof width === 'number') {
        s.width = `${width}px`;
      } else {
        s.width = width;
      }
    }
    return s;
  }, [zIndex, top, left, right, bottom, width]);

  const contentStyle = useMemo(() => {
    return { maxHeight: `${maxHeight}px` };
  }, [maxHeight]);

  const isAutoWidth = !width || width == 'auto';

  if (!show) return null;

  return (
    <div
      className={`float-container ${isAutoWidth ? 'auto-float-container' : ''}`}
      style={style}
    >
      <Card highlight={isHighlight}>
        <div className="draggable-float">
          {!disabledHeader && headerLocation === 'top' && (
            <Header
              title={title}
              extraBtn={
                <>
                  {extraBtn}
                  <MapButton onClick={onToggleExpand}>
                    {expand ? (
                      <ExpandedIcon size={'16px'} />
                    ) : (
                      <CloseExpandedIcon size={'16px'} />
                    )}
                  </MapButton>
                  {isHasItems && !disabledOrder && (
                    <>
                      <MapButton disabled={isFirst} onClick={onToBack}>
                        <ToBackIcon size={'16px'} />
                      </MapButton>
                      <MapButton disabled={isLast} onClick={onToFront}>
                        <ToFrontIcon size={'16px'} />
                      </MapButton>
                    </>
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
          {expand && (
            <div className="draggable-float-content" style={contentStyle}>
              {children}
            </div>
          )}
          {!disabledHeader && headerLocation === 'bottom' && (
            <Header
              title={title}
              extraBtn={
                <>
                  {extraBtn}
                  <MapButton onClick={onToggleExpand}>
                    {expand ? (
                      <ExpandedIcon size={'16px'} />
                    ) : (
                      <CloseExpandedIcon size={'16px'} />
                    )}
                  </MapButton>
                  {isHasItems && !disabledOrder && (
                    <>
                      <MapButton disabled={isFirst} onClick={onToBack}>
                        <ToBackIcon size={'16px'} />
                      </MapButton>
                      <MapButton disabled={isLast} onClick={onToFront}>
                        <ToFrontIcon size={'16px'} />
                      </MapButton>
                    </>
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
        </div>
      </Card>
    </div>
  );
}
