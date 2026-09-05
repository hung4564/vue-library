import { ReactNode, useCallback, useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { Rnd } from 'react-rnd';
import { useContainerId } from '../../context/ContainerContext';
import {
  ShareCardComponent,
  ShareHeaderComponent,
  useComponent,
  useHighlight,
  useIcon,
  useInitAction,
  useInitItem,
  useShow,
} from '../../hook';
import { MapButton } from '../parts/MapButton';

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
  show?: boolean;
  title?: string;
  containerId?: string;
  componentCard?: ShareCardComponent;
  componentCardHeader?: ShareHeaderComponent;
  disabledHeader?: boolean;
  disabledClose?: boolean;
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
  children?: ReactNode;
  extraBtn?: ReactNode;
}

export function DraggableModal({
  show: propShow,
  title = '',
  containerId: propContainerId,
  componentCard,
  componentCardHeader,
  disabledHeader,
  disabledClose,
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
  const { itemId, zIndex } = useInitItem(containerId, show, setShow, {
    title,
    type: 'item-modal',
  });
  const stackZIndex = MODAL_Z_INDEX + zIndex;
  const { isHighlight, setHighLight } = useHighlight();
  useInitAction(containerId, itemId, {
    setHighLight,
    open,
    close,
  });
  const [initDone, setInitDone] = useState(false);
  const [layerEl, setLayerEl] = useState<HTMLElement | null>(null);
  const [layerWidth, setLayerWidth] = useState(0);
  const [layerHeight, setLayerHeight] = useState(0);
  const [p_height, setPHeight] = useState(propHeight || 320);
  const [p_width, setPWidth] = useState(propWidth || 480);
  const [p_x, setPX] = useState(0);
  const [p_y, setPY] = useState(0);

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
      setPX(data.x);
      setPY(data.y);
    },
    [],
  );

  const handleResizeStop = useCallback(
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

  const handleClose = useCallback(
    (e?: { stopPropagation?: () => void }) => {
      e?.stopPropagation?.();
      setShow(false);
    },
    [setShow],
  );

  const handleMaskClick = useCallback(() => {
    if (maskClosable) {
      setShow(false);
    }
  }, [maskClosable, setShow]);

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
    if (!show) {
      setInitDone(false);
      return;
    }

    if (layerWidth <= 0 || layerHeight <= 0) {
      setInitDone(false);
      return;
    }

    const width = propWidth || 480;
    const height = propHeight || 320;
    setPWidth(width);
    setPHeight(height);

    let x = 0;
    let y = 0;
    const hasX = left != null || right != null;
    const hasY = top != null || bottom != null;

    if (left != null) {
      x = left;
    }
    if (top != null) {
      y = top;
    }
    if (right != null) {
      x = layerWidth - right - width;
    }
    if (bottom != null) {
      y = layerHeight - bottom - height;
    }
    if (!hasX && (center || centerX)) {
      x = Math.max(0, (layerWidth - width) / 2);
    }
    if (!hasY && (center || centerY)) {
      y = Math.max(0, (layerHeight - height) / 2);
    }

    setPX(x);
    setPY(y);
    setInitDone(true);
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
  ]);

  function onDragging() {
    window?.getSelection()?.removeAllRanges();
  }

  if (!show || !initDone || !layerEl) return null;

  return createPortal(
    <div className="draggable-modal-root" style={{ zIndex: stackZIndex }}>
      {mask && (
        <div className="draggable-modal-mask" onClick={handleMaskClick} />
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
      >
        <Card width={p_width} height={p_height} highlight={isHighlight}>
          <div className="draggable-modal-desktop">
            {!disabledHeader && (
              <Header
                title={title}
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
                      <MapButton onClick={handleClose}>
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
