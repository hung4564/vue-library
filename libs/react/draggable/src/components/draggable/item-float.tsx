import { focusFirst, restoreFocus } from '@hungpvq/draggable';
import {
  useEffect,
  useMemo,
  useRef,
  type CSSProperties,
  type ReactNode,
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
import { MapButton } from '../parts/MapButton';
export interface DraggableItemFloatProps {
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
  id: stableId,
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
  highlightMs,
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
  const { zIndex, itemId } = useInitItem(
    containerId,
    show,
    setShow,
    {
      title,
      type: 'item-float',
    },
    stableId,
  );
  const { isHighlight, setHighLight } = useHighlight(highlightMs);
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

  const panelRootRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const titleId = `float-title-${itemId}`;

  function handleClose() {
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
      if (panelRootRef.current) focusFirst(panelRootRef.current);
    }, 0);
    function onKeydown(event: KeyboardEvent) {
      if (event.key !== 'Escape') return;
      const root = panelRootRef.current;
      if (!root) return;
      const target = event.target as Node | null;
      if (target && !root.contains(target) && document.activeElement !== root) {
        return;
      }
      event.preventDefault();
      setShow(false);
    }
    document.addEventListener('keydown', onKeydown);
    return () => {
      window.clearTimeout(focusTimer);
      document.removeEventListener('keydown', onKeydown);
    };
  }, [show, setShow]);

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

  const isAutoWidth = !width || width === 'auto';

  if (!show) return null;

  return (
    <div
      ref={panelRootRef}
      className={`float-container ${isAutoWidth ? 'auto-float-container' : ''}`}
      style={style}
      role="dialog"
      aria-labelledby={titleId}
      tabIndex={-1}
    >
      <Card highlight={isHighlight}>
        <div className="draggable-float">
          {!disabledHeader && headerLocation === 'top' && (
            <Header
              title={<span id={titleId}>{title}</span>}
              extraBtn={
                <>
                  {extraBtn}
                  <MapButton
                    aria-label={expand ? 'Collapse panel' : 'Expand panel'}
                    aria-expanded={expand}
                    onClick={onToggleExpand}
                  >
                    {expand ? (
                      <ExpandedIcon size={'16px'} />
                    ) : (
                      <CloseExpandedIcon size={'16px'} />
                    )}
                  </MapButton>
                  {isHasItems && !disabledOrder && (
                    <>
                      <MapButton
                        aria-label="Send to back"
                        disabled={isFirst}
                        onClick={onToBack}
                      >
                        <ToBackIcon size={'16px'} />
                      </MapButton>
                      <MapButton
                        aria-label="Bring to front"
                        disabled={isLast}
                        onClick={onToFront}
                      >
                        <ToFrontIcon size={'16px'} />
                      </MapButton>
                    </>
                  )}
                  {!disabledClose && (
                    <MapButton aria-label="Close panel" onClick={handleClose}>
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
              title={<span id={titleId}>{title}</span>}
              extraBtn={
                <>
                  {extraBtn}
                  <MapButton
                    aria-label={expand ? 'Collapse panel' : 'Expand panel'}
                    aria-expanded={expand}
                    onClick={onToggleExpand}
                  >
                    {expand ? (
                      <ExpandedIcon size={'16px'} />
                    ) : (
                      <CloseExpandedIcon size={'16px'} />
                    )}
                  </MapButton>
                  {isHasItems && !disabledOrder && (
                    <>
                      <MapButton
                        aria-label="Send to back"
                        disabled={isFirst}
                        onClick={onToBack}
                      >
                        <ToBackIcon size={'16px'} />
                      </MapButton>
                      <MapButton
                        aria-label="Bring to front"
                        disabled={isLast}
                        onClick={onToFront}
                      >
                        <ToFrontIcon size={'16px'} />
                      </MapButton>
                    </>
                  )}
                  {!disabledClose && (
                    <MapButton aria-label="Close panel" onClick={handleClose}>
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
