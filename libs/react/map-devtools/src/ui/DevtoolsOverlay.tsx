import { isDevtoolsMobileViewport } from '@hungpvq/map-core/devtools';
import {
  beginPanelDrag,
  panelPosStyle,
  type PanelPos,
} from '@hungpvq/map-debug';
import { MapControlButton } from '@hungpvq/react-map-core';
import { mdiClose, mdiTools } from '@mdi/js';
import Icon from '@mdi/react';
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type MouseEvent as ReactMouseEvent,
  type PointerEvent as ReactPointerEvent,
} from 'react';
import { setDevtoolOpen } from '../store';
import '../style.css';
import { useDevtoolState } from '../useDevtoolState';
import { DevtoolsPanelBody } from './DevtoolsPanelBody';

export function DevtoolsOverlay({
  containerId: _containerId,
  mapId: _mapId,
}: {
  containerId?: string;
  mapId?: string;
}) {
  const { isOpen, activeTab, logs, errors } = useDevtoolState();
  const logCount = logs.length;
  const errorCount = errors.length;
  const [isMobile, setIsMobile] = useState(isDevtoolsMobileViewport);
  const [pos, setPos] = useState<PanelPos | null>(null);
  const [dragging, setDragging] = useState(false);
  const shellRef = useRef<HTMLDivElement | null>(null);
  const dragMovedRef = useRef(false);
  const disposeDragRef = useRef<(() => void) | undefined>(undefined);

  useEffect(() => {
    const onResize = () => setIsMobile(isDevtoolsMobileViewport());
    onResize();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(
    () => () => {
      disposeDragRef.current?.();
    },
    [],
  );

  const onShellPointerDown = useCallback((e: ReactPointerEvent) => {
    if (!shellRef.current) return;
    dragMovedRef.current = false;
    disposeDragRef.current?.();
    disposeDragRef.current = beginPanelDrag(shellRef.current, e.nativeEvent, {
      onMove: setPos,
      onDraggingChange: setDragging,
      onEnd: (moved) => {
        dragMovedRef.current = moved;
        disposeDragRef.current = undefined;
      },
    });
  }, []);

  const open = () => setDevtoolOpen(true);
  const close = () => setDevtoolOpen(false);

  const onToggleClick = (e: ReactMouseEvent) => {
    if (dragMovedRef.current) {
      e.preventDefault();
      e.stopPropagation();
      dragMovedRef.current = false;
      return;
    }
    open();
  };

  const shellStyle = panelPosStyle(pos) as CSSProperties | undefined;

  const className = [
    'devtools-container',
    isMobile ? 'devtools-container--mobile' : '',
    isOpen ? 'devtools-container--open' : '',
    dragging ? 'devtools-container--dragging' : '',
    pos ? 'devtools-container--moved' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div ref={shellRef} className={className} style={shellStyle}>
      {!isOpen ? (
        <MapControlButton
          className="devtools-toggle"
          variant="icon"
          size={48}
          title="Map Devtools — drag to move"
          aria-label="Map Devtools"
          onPointerDown={onShellPointerDown}
          onClick={onToggleClick}
        >
          <Icon path={mdiTools} size="22px" />
        </MapControlButton>
      ) : (
        <div
          className={`devtools-panel${isMobile ? ' devtools-panel--mobile' : ''}`}
        >
          <div
            className="devtools-drag-bar"
            title="Drag to move"
            onPointerDown={onShellPointerDown}
          >
            <span className="devtools-drag-bar__label">Map Devtools</span>
            <span className="devtools-drag-bar__actions">
              <span className="devtools-drag-bar__hint" aria-hidden="true">
                ⠿
              </span>
              <MapControlButton
                className="devtools-drag-bar__close"
                variant="icon"
                size="small"
                title="Close"
                aria-label="Close Map Devtools"
                onPointerDown={(e) => e.stopPropagation()}
                onClick={(e) => {
                  e.stopPropagation();
                  close();
                }}
              >
                <Icon path={mdiClose} size="16px" />
              </MapControlButton>
            </span>
          </div>
          <DevtoolsPanelBody
            activeTab={activeTab}
            logCount={logCount}
            errorCount={errorCount}
          />
        </div>
      )}
    </div>
  );
}
