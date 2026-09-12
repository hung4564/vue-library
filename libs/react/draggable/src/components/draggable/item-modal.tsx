import { clampBounds, focusFirst, setModalSiblingsInert, trapTabKey } from '@hungpvq/draggable';
import {
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { createPortal } from 'react-dom';
import { Rnd } from 'react-rnd';
import { useContainerId } from '../../context/ContainerContext';
import {
  ShareCardComponent,
  ShareHeaderComponent,
  useComponent,
  useContainerOrder,
  useHighlight,
  useIcon,
  useInitAction,
  useInitItem,
  useShow,
} from '../../hook';
import { MapButton } from '../parts/MapButton';
import { useDragLayout } from '../../store';

const MODAL_Z_INDEX = 10000;

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

export interface DraggableModalProps {
  id?: string;
  show?: boolean;
  title?: string;
  containerId?: string;
  componentCard?: ShareCardComponent;
  componentCardHeader?: ShareHeaderComponent;
  disabledHeader?: boolean;
  disabledClose?: boolean;
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
  mask?: boolean;
  maskClosable?: boolean;
  draggable?: boolean;
  resizable?: boolean;
  onUpdateShow?: (value: boolean) => void;
  onClose?: () => void;
  onBoundsChange?: (bounds: {
    x: number;
    y: number;
    width: number;
    height: number;
  }) => void;
  children?: ReactNode;
  extraBtn?: ReactNode;
}

export function DraggableModal({
  id: stableId,
  show: propShow,
  title = '',
  containerId: propContainerId,
  componentCard,
  componentCardHeader,
  disabledHeader,
  disabledClose,
  highlightMs,
  sticks = ['bl', 'br', 'tl', 'tr'],
  top,
  left,
  bottom,
  right,
  width: propWidth = 480,
  height: propHeight = 320,
  centerX = true,
  centerY = true,
  center = true,
  mask = true,
  maskClosable = true,
  draggable = true,
  resizable = true,
  onUpdateShow,
  onClose,
  onBoundsChange,
  children,
  extraBtn,
}: DraggableModalProps) {
  const containerId = useContainerId(propContainerId);
  const { show, setShow, open, close } = useShow(
    { show: propShow },
    {
      'update:show': onUpdateShow,
      close: onClose,
    },
  );
  const { itemId, zIndex } = useInitItem(
    containerId,
    show,
    setShow,
    {
      title,
      type: 'item-modal',
    },
    stableId,
  );
  const stackZIndex = MODAL_Z_INDEX + zIndex;
  const titleId = `draggable-modal-title-${itemId}`;
  const { isHighlight, setHighLight } = useHighlight(highlightMs);
  useInitAction(containerId, itemId, {
    setHighLight,
    open,
    close,
  });
  const { onToFront } = useContainerOrder(containerId, itemId);
  const dragLayout = useDragLayout(containerId);
  const dragLayoutRef = useRef(dragLayout);
  dragLayoutRef.current = dragLayout;
  const [initDone, setInitDone] = useState(false);
  const [layerEl, setLayerEl] = useState<HTMLElement | null>(null);
  const [layerWidth, setLayerWidth] = useState(0);
  const [layerHeight, setLayerHeight] = useState(0);
  const [p_height, setPHeight] = useState(propHeight || 320);
  const [p_width, setPWidth] = useState(propWidth || 480);
  const [p_x, setPX] = useState(0);
  const [p_y, setPY] = useState(0);
  const modalRootRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const mountedRef = useRef(false);
  const boundsRef = useRef({
    x: 0,
    y: 0,
    width: propWidth || 480,
    height: propHeight || 320,
  });
  const onBoundsChangeRef = useRef(onBoundsChange);
  onBoundsChangeRef.current = onBoundsChange;

  const { componentCard: Card, componentCardHeader: Header } = useComponent({
    componentCard,
    componentCardHeader,
    containerId,
  });

  const { CloseIcon, DragIcon } = useIcon();

  const enableResizing = useMemo(() => {
    if (!resizable) {
      const out: Record<string, boolean> = {};
      RESIZE_KEYS.forEach((k) => (out[k] = false));
      return out;
    }
    const out: Record<string, boolean> = {};
    RESIZE_KEYS.forEach((k) => (out[k] = false));
    sticks.forEach((s) => {
      const k = STICKS_TO_RND[s];
      if (k) out[k] = true;
    });
    return out;
  }, [sticks, resizable]);

  const emitBounds = useCallback(
    (x: number, y: number, width: number, height: number) => {
      const next = clampBounds(x, y, width, height, layerWidth, layerHeight);
      setPX(next.x);
      setPY(next.y);
      setPWidth(next.width);
      setPHeight(next.height);
      boundsRef.current = next;
      dragLayoutRef.current.setItemLayout(itemId, { bounds: next });
      onBoundsChangeRef.current?.(next);
    },
    [layerWidth, layerHeight, itemId],
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
    (e?: { stopPropagation?: () => void }) => {
      e?.stopPropagation?.();
      close();
    },
    [close],
  );

  const handleMaskClick = useCallback(() => {
    if (maskClosable) {
      close();
    }
  }, [maskClosable, close]);

  useEffect(() => {
    const sync = () => {
      const el = document.getElementById(`modal-layer-${containerId}`);
      setLayerEl(el);
      setLayerWidth(el?.clientWidth || 0);
      setLayerHeight(el?.clientHeight || 0);
    };
    sync();
    const timer = window.setInterval(sync, 100);
    window.addEventListener('resize', sync);
    return () => {
      window.clearInterval(timer);
      window.removeEventListener('resize', sync);
    };
  }, [containerId]);

  useEffect(() => {
    if (!show) return;
    const layer = document.getElementById(`modal-layer-${containerId}`);
    setModalSiblingsInert(layer, true);
    return () => {
      setModalSiblingsInert(
        document.getElementById(`modal-layer-${containerId}`),
        false,
      );
    };
  }, [show, containerId]);

  useEffect(() => {
    if (!show) {
      setInitDone(false);
      mountedRef.current = false;
      if (previousFocusRef.current?.focus) {
        previousFocusRef.current.focus();
      }
      previousFocusRef.current = null;
      return;
    }

    if (layerWidth <= 0 || layerHeight <= 0) {
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
        layerWidth,
        layerHeight,
      );
      setPWidth(next.width);
      setPHeight(next.height);
      setPX(next.x);
      setPY(next.y);
      boundsRef.current = next;
      setInitDone(true);
      mountedRef.current = true;
    } else {
      const width = propWidth || 480;
      const height = propHeight || 320;
      let x = 0;
      let y = 0;
      const hasX = left != null || right != null;
      const hasY = top != null || bottom != null;

      if (left != null) x = left;
      if (top != null) y = top;
      if (right != null) x = layerWidth - right - width;
      if (bottom != null) y = layerHeight - bottom - height;
      if (!hasX && (center || centerX)) {
        x = Math.max(0, (layerWidth - width) / 2);
      }
      if (!hasY && (center || centerY)) {
        y = Math.max(0, (layerHeight - height) / 2);
      }

      const next = clampBounds(x, y, width, height, layerWidth, layerHeight);
      setPWidth(next.width);
      setPHeight(next.height);
      setPX(next.x);
      setPY(next.y);
      boundsRef.current = next;
      setInitDone(true);
      mountedRef.current = true;
    }

    previousFocusRef.current = document.activeElement as HTMLElement | null;
    const focusTimer = window.setTimeout(() => {
      if (modalRootRef.current) focusFirst(modalRootRef.current);
    }, 0);

    function onKeydown(event: KeyboardEvent) {
      if (!modalRootRef.current) return;
      if (event.key === 'Escape') {
        event.preventDefault();
        close();
        return;
      }
      trapTabKey(modalRootRef.current, event);
    }

    document.addEventListener('keydown', onKeydown);
    return () => {
      window.clearTimeout(focusTimer);
      document.removeEventListener('keydown', onKeydown);
    };
  }, [
    show,
    layerWidth,
    layerHeight,
    left,
    top,
    right,
    bottom,
    center,
    centerX,
    centerY,
    propWidth,
    propHeight,
    close,
    itemId,
  ]);

  function onDragging() {
    window?.getSelection()?.removeAllRanges();
  }

  if (!show || !initDone || !layerEl) return null;

  return createPortal(
    <div
      ref={modalRootRef}
      className="draggable-modal-root"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      tabIndex={-1}
      style={{ zIndex: stackZIndex }}
    >
      {mask && (
        <div
          className="draggable-modal-mask"
          aria-hidden="true"
          onClick={handleMaskClick}
        />
      )}
      <Rnd
        className="draggable-modal-panel"
        size={{ width: p_width, height: p_height }}
        position={{ x: p_x, y: p_y }}
        style={{ zIndex: stackZIndex + 1, overflow: 'visible' }}
        bounds="parent"
        disableDragging={!draggable}
        dragHandleClassName="drag"
        enableResizing={enableResizing}
        onResize={handleResize}
        onResizeStop={handleResizeStop}
        onDrag={onDragging}
        onDragStop={handleDragStop}
        onMouseDown={onToFront}
      >
        <Card width={p_width} height={p_height} highlight={isHighlight}>
          <div className="draggable-modal-desktop">
            {!disabledHeader && (
              <Header
                title={<span id={titleId}>{title}</span>}
                preTitle={
                  draggable ? (
                    <div className="draggable-popup-drag-container">
                      <DragIcon size={'16px'} />
                      <div className="drag grabbing"></div>
                    </div>
                  ) : undefined
                }
                extraBtn={
                  <>
                    {extraBtn}
                    {!disabledClose && (
                      <MapButton aria-label="Close dialog" onClick={handleClose}>
                        <CloseIcon size={'16px'} />
                      </MapButton>
                    )}
                  </>
                }
              />
            )}
            <div className="draggable-modal-desktop-content">{children}</div>
          </div>
        </Card>
      </Rnd>
    </div>,
    layerEl,
  );
}
