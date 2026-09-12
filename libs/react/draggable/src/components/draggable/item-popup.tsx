import { clampBounds, focusFirst, restoreFocus, trapTabKey } from '@hungpvq/draggable';
import {
  type MouseEvent,
  type ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
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
import { useDragLayout } from '../../store';
import { DragButton } from '../parts/DragButton';

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
  id?: string;
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
  highlightMs?: number;
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
  onBoundsChange?: (bounds: {
    x: number;
    y: number;
    width: number;
    height: number;
  }) => void;
  children?: ReactNode;
  extraBtn?: ReactNode;
}

export function DraggableItemPopup({
  id: stableId,
  show: propShow,
  expand: propExpand,
  title = '',
  containerId: propContainerId,
  componentCard,
  componentCardHeader,
  disabledHeader,
  disabledClose,
  disabledOrder,
  highlightMs,
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
  onBoundsChange,
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
  const { zIndex, itemId } = useInitItem(
    containerId,
    show,
    setShow,
    {
      title,
      type: 'item-popup',
    },
    stableId,
  );
  const { isHighlight, setHighLight } = useHighlight(highlightMs);
  useInitAction(containerId, itemId, {
    setHighLight,
    open,
    close,
  });
  const { containerWidth, containerHeight } = useContainerSize(containerId);
  const { isLast, isFirst, isHasItems, onToBack, onToFront } =
    useContainerOrder(containerId, itemId);
  const dragLayout = useDragLayout(containerId);
  const dragLayoutRef = useRef(dragLayout);
  dragLayoutRef.current = dragLayout;
  const [initDone, setInitDone] = useState(false);
  const [p_height, setPHeight] = useState(propHeight || 200);
  const [old_height, setOldHeight] = useState(p_height);
  const [p_width, setPWidth] = useState(propWidth || 200);
  const [p_x, setPX] = useState(0);
  const [p_y, setPY] = useState(0);
  const boundsRef = useRef({
    x: 0,
    y: 0,
    width: propWidth || 200,
    height: propHeight || 200,
  });
  const onBoundsChangeRef = useRef(onBoundsChange);
  onBoundsChangeRef.current = onBoundsChange;
  const mountedRef = useRef(false);
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

  const emitBounds = useCallback(
    (x: number, y: number, width: number, height: number) => {
      const next = clampBounds(
        x,
        y,
        width,
        height,
        containerWidth,
        containerHeight,
      );
      setPX(next.x);
      setPY(next.y);
      setPWidth(next.width);
      setPHeight(next.height);
      boundsRef.current = next;
      dragLayoutRef.current.setItemLayout(itemId, { bounds: next });
      onBoundsChangeRef.current?.(next);
    },
    [containerWidth, containerHeight, itemId],
  );

  const handleResize = useCallback(
    (
      _e: unknown,
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
      emitBounds(
        data.x,
        data.y,
        boundsRef.current.width,
        boundsRef.current.height,
      );
    },
    [emitBounds],
  );

  const handleResizeStop = useCallback(
    (
      _e: unknown,
      _dir: unknown,
      elementRef: HTMLElement,
      _delta: unknown,
      position: { x: number; y: number },
    ) => {
      emitBounds(
        position.x,
        position.y,
        elementRef.offsetWidth,
        elementRef.offsetHeight,
      );
    },
    [emitBounds],
  );

  const handleClose = useCallback(
    (e?: MouseEvent) => {
      e?.stopPropagation();
      close();
    },
    [close],
  );

  const panelRootRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const titleId = `popup-title-${itemId}`;

  useEffect(() => {
    if (!show) {
      restoreFocus(previousFocusRef.current);
      previousFocusRef.current = null;
      return;
    }
    previousFocusRef.current = document.activeElement as HTMLElement | null;
    const focusTimer = window.setTimeout(() => {
      if (panelRootRef.current) focusFirst(panelRootRef.current);
    }, 0);
    function onKeydown(event: KeyboardEvent) {
      const root = panelRootRef.current;
      if (!root) return;
      if (event.key === 'Tab') {
        trapTabKey(root, event);
        return;
      }
      if (event.key !== 'Escape') return;
      const target = event.target as Node | null;
      if (target && !root.contains(target) && document.activeElement !== root) {
        return;
      }
      event.preventDefault();
      close();
    }
    document.addEventListener('keydown', onKeydown);
    return () => {
      window.clearTimeout(focusTimer);
      document.removeEventListener('keydown', onKeydown);
    };
  }, [show, close]);

  useEffect(() => {
    if (!show) {
      setInitDone(false);
      mountedRef.current = false;
      return;
    }

    if (containerWidth <= 0 || containerHeight <= 0) {
      setInitDone(false);
      return;
    }

    const saved = dragLayoutRef.current.getItemLayout(itemId)?.bounds;
    if (saved && !mountedRef.current) {
      const next = clampBounds(
        saved.x,
        saved.y,
        saved.width,
        saved.height,
        containerWidth,
        containerHeight,
      );
      setPX(next.x);
      setPY(next.y);
      setPWidth(next.width);
      setPHeight(next.height);
      boundsRef.current = next;
      setInitDone(true);
      mountedRef.current = true;
      return;
    }

    let x = boundsRef.current.x;
    let y = boundsRef.current.y;
    const w = propWidth || boundsRef.current.width || 200;
    const h = propHeight || boundsRef.current.height || 200;

    if (left != null) x = left;
    if (top != null) y = top;
    if (right != null) x = containerWidth - right - w;
    if (bottom != null) y = containerHeight - bottom - h;
    if (center || centerX) x = (containerWidth - w) / 2;
    if (center || centerY) y = (containerHeight - h) / 2;

    const next = clampBounds(x, y, w, h, containerWidth, containerHeight);
    setPX(next.x);
    setPY(next.y);
    setPWidth(next.width);
    setPHeight(next.height);
    boundsRef.current = next;
    setInitDone(true);
    mountedRef.current = true;
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
    propWidth,
    propHeight,
    itemId,
  ]);

  useEffect(() => {
    if (!initDone || !show || !mountedRef.current) return;
    let changed = false;
    let x = boundsRef.current.x;
    let y = boundsRef.current.y;
    let w = boundsRef.current.width;
    let h = boundsRef.current.height;
    if (propWidth != null && propWidth !== w) {
      w = propWidth;
      changed = true;
    }
    if (propHeight != null && propHeight !== h) {
      h = propHeight;
      changed = true;
    }
    if (left != null && left !== x) {
      x = left;
      changed = true;
    }
    if (top != null && top !== y) {
      y = top;
      changed = true;
    }
    if (!changed) return;
    const next = clampBounds(x, y, w, h, containerWidth, containerHeight);
    setPX(next.x);
    setPY(next.y);
    setPWidth(next.width);
    setPHeight(next.height);
    boundsRef.current = next;
  }, [
    left,
    top,
    propWidth,
    propHeight,
    initDone,
    show,
    containerWidth,
    containerHeight,
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
      style={{ zIndex, overflow: 'visible' }}
      bounds="parent"
      dragHandleClassName="drag"
      enableResizing={enableResizing}
      onResize={handleResize}
      onResizeStop={handleResizeStop}
      onDrag={onDragging}
      onDragStop={handleDragStop}
      onMouseDown={onToFront}
    >
      <Card width={p_width} height={p_height} highlight={isHighlight}>
        <div
          ref={panelRootRef}
          className="draggable-popup-desktop"
          role="dialog"
          aria-labelledby={titleId}
          tabIndex={-1}
        >
          {!disabledHeader && (
            <Header
              title={<span id={titleId}>{title}</span>}
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
                      <DragButton
                        aria-label="Send to back"
                        disabled={isFirst}
                        onClick={onToBack}
                      >
                        <ToBackIcon size={'16px'} />
                      </DragButton>
                      <DragButton
                        aria-label="Bring to front"
                        disabled={isLast}
                        onClick={onToFront}
                      >
                        <ToFrontIcon size={'16px'} />
                      </DragButton>
                    </>
                  )}
                  <DragButton
                    aria-label={expand ? 'Collapse panel' : 'Expand panel'}
                    aria-expanded={expand}
                    onClick={onToggleExpanded}
                  >
                    {expand ? (
                      <ExpandedIcon size={'16px'} />
                    ) : (
                      <CloseExpandedIcon size={'16px'} />
                    )}
                  </DragButton>
                  {!disabledClose && (
                    <DragButton aria-label="Close panel" onClick={handleClose}>
                      <CloseIcon size={'16px'} />
                    </DragButton>
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
