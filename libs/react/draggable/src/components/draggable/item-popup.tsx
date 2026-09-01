import { ReactNode, useCallback, useEffect, useMemo, useState } from 'react';
import { Rnd } from 'react-rnd';
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
import { useContainerSize } from '../../hook/useContainerSize';
import { MapButton } from '../parts/MapButton';
const STICKS_TO_RND: Record<string, string> = {
  t: 'top',
  r: 'right',
  b: 'bottom',
  l: 'left',
  tl: 'topLeft',
  tr: 'topRight',
  bl: 'bottomLeft',
  br: 'bottomRight',
};
const RESIZE_KEYS = [
  'top',
  'right',
  'bottom',
  'left',
  'topRight',
  'bottomRight',
  'bottomLeft',
  'topLeft',
];

export interface DraggableItemPopupProps {
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
  sticks?: string[];
  top?: number;
  left?: number;
  bottom?: number;
  right?: number;
  width?: number;
  height?: number;
  centerX?: boolean;
  centerY?: boolean;
  center?: boolean;
  onUpdateShow?: (value: boolean) => void;
  onClose?: () => void;
  onUpdateExpand?: (value: boolean) => void;
  children?: ReactNode;
  extraBtn?: ReactNode;
}

export function DraggableItemPopup({
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
  sticks = ['bl', 'br'],
  top,
  left,
  bottom,
  right,
  width: propWidth = 200,
  height: propHeight = 200,
  centerX,
  centerY,
  center,
  onUpdateShow,
  onClose,
  onUpdateExpand,
  children,
  extraBtn,
}: DraggableItemPopupProps) {
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
    type: 'item-popup',
  });
  const { isHighlight, setHighLight } = useHighlight();
  useInitAction(containerId, itemId, {
    setHighLight,
    open,
    close,
  });
  const { containerWidth, containerHeight } = useContainerSize(containerId);
  const { isLast, isFirst, isHasItems, onToBack, onToFront } =
    useContainerOrder(containerId, itemId);
  const [initDone, setInitDone] = useState(false);
  const [p_height, setPHeight] = useState(propHeight || 200);
  const [old_height, setOldHeight] = useState(p_height);
  const [p_width, setPWidth] = useState(propWidth || 200);
  const [p_x, setPX] = useState(0);
  const [p_y, setPY] = useState(0);
  const { expand, setExpand } = useExpand(
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
    CloseExpandedIcon,
    DragIcon,
    ExpandedIcon,
    ToBackIcon,
    ToFrontIcon,
  } = useIcon();

  const enableResizing = useMemo(() => {
    const out: Record<string, boolean> = {};
    RESIZE_KEYS.forEach((k) => (out[k] = false));
    sticks.forEach((s) => {
      const k = STICKS_TO_RND[s];
      if (k) out[k] = true;
    });
    return out;
  }, [sticks]);

  const handleResize = useCallback(
    (
      _e: MouseEvent | TouchEvent,
      _dir: unknown,
      elementRef: HTMLElement,
      _delta: unknown,
      position: { x: number; y: number },
    ) => {
      setPWidth(elementRef.offsetWidth);
      setPHeight(elementRef.offsetHeight);
      setPX(position.x);
      setPY(position.y);
    },
    [],
  );

  const handleDragStop = useCallback(
    (_e: unknown, data: { x: number; y: number }) => {
      setPX(data.x);
      setPY(data.y);
    },
    [],
  );

  const handleResizeStop = useCallback(
    (
      _e: MouseEvent | TouchEvent,
      _dir: unknown,
      elementRef: HTMLElement,
      _delta: unknown,
      position: { x: number; y: number },
    ) => {
      setPWidth(elementRef.offsetWidth);
      setPHeight(elementRef.offsetHeight);
      setPX(position.x);
      setPY(position.y);
    },
    [],
  );

  function handleClose() {
    setShow(false);
  }

  useEffect(() => {
    if (!show) {
      setInitDone(false);
      return;
    }

    if (containerWidth <= 0 || containerHeight <= 0) {
      setInitDone(false);
      return;
    }

    let x = 0;
    let y = 0;

    if (left != null) {
      x = left;
    }
    if (top != null) {
      y = top;
    }
    if (right != null) {
      x = containerWidth - right - p_width;
    }
    if (bottom != null) {
      y = containerHeight - bottom - p_height;
    }
    if (center || centerX) {
      x = (containerWidth - p_width) / 2;
    }
    if (center || centerY) {
      y = (containerHeight - p_height) / 2;
    }

    setPX(x);
    setPY(y);
    setInitDone(true);
  }, [
    show,
    containerWidth,
    containerHeight,
    left,
    top,
    right,
    bottom,
    center,
    centerX,
    centerY,
    p_width,
    p_height,
  ]);

  function onToggleExpanded() {
    if (expand && p_height > 50) {
      setOldHeight(p_height);
    }
    const newExpand = !expand;
    setExpand(newExpand);
    setPHeight(newExpand ? old_height : 50);
  }

  function onDragging() {
    window?.getSelection()?.removeAllRanges();
  }

  if (!show || !initDone) return null;

  return (
    <Rnd
      className="draggable-popup-wrapper"
      size={{ width: p_width, height: p_height }}
      position={{ x: p_x, y: p_y }}
      style={{ zIndex }}
      bounds="parent"
      dragHandleClassName="drag"
      enableResizing={enableResizing}
      onResize={handleResize}
      onResizeStop={handleResizeStop}
      onDrag={onDragging}
      onDragStop={handleDragStop}
    >
      <Card width={p_width} height={p_height} highlight={isHighlight}>
        <div className="draggable-popup-desktop">
          {!disabledHeader && (
            <Header
              title={title}
              preTitle={
                <div className="draggable-popup-drag-container">
                  <DragIcon size={'16px'} />
                  <div className="drag grabbing"></div>
                </div>
              }
              extraBtn={
                <>
                  {extraBtn}
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
                  <MapButton onClick={onToggleExpanded}>
                    {expand ? (
                      <ExpandedIcon size={'16px'} />
                    ) : (
                      <CloseExpandedIcon size={'16px'} />
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
          {expand && (
            <div className="draggable-popup-desktop-content">{children}</div>
          )}
        </div>
      </Card>
    </Rnd>
  );
}
