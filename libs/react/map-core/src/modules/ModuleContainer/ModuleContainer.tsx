import {
  buildModuleBindPosition,
  getControlAutoButton,
  isModuleCornerChromeVisible,
  moduleBtnContainerClassName,
  moduleCornerHostSelector,
  moduleDraggableHostSelector,
  type Position,
  queryModuleHostElement,
  subscribeControlAutoButton,
} from '@hungpvq/map-core';
import type { MapControlButtonUIState } from '@hungpvq/map-core/toolbar';
import React, { useEffect, useLayoutEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';

import { MapCommonButton } from '../../components/MapCommonButton';
import { useMapContext } from '../../context/MapContext';

export interface ModuleContainerProps {
  mapId?: string;
  dragId?: string;
  btnWidth?: number;
  controlOrder?: number;
  /** Control id → class `{controlId}-btn-module-container` */
  controlId?: string;
  position?: Position;
  controlVisible?: boolean;
  controlLayout?: 'toolbar' | 'standalone' | 'button' | 'menu';
  btn?: React.ReactNode;
  /**
   * Teleported to the same corner host as `btn`, sibling outside
   * `.btn-module-container` (absolute panels pin to the map corner).
   */
  btnOutside?: React.ReactNode;
  draggable?: (bindDrag: BindPosition) => React.ReactNode;
  children?: React.ReactNode;
}

export interface BindPosition {
  top?: number;
  bottom?: number;
  left?: number;
  right?: number;
  containerId: string;
}

function useModuleHostElement(selector: string | null): HTMLElement | null {
  const [host, setHost] = useState<HTMLElement | null>(() =>
    selector ? queryModuleHostElement(selector) : null,
  );

  useLayoutEffect(() => {
    if (!selector) {
      setHost(null);
      return;
    }

    const found = queryModuleHostElement(selector);
    if (found) {
      setHost(found);
      return;
    }

    setHost(null);
    if (
      typeof document === 'undefined' ||
      typeof MutationObserver === 'undefined'
    ) {
      return;
    }

    const observer = new MutationObserver(() => {
      const el = queryModuleHostElement(selector);
      if (el) {
        setHost(el);
        observer.disconnect();
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, [selector]);

  return host;
}

export function ModuleContainer({
  mapId: propsMapId,
  dragId: propsDragId,
  btnWidth = 40,
  controlOrder = 0,
  controlId = '',
  position = 'bottom-right',
  controlVisible = true,
  controlLayout = 'standalone',
  btn,
  btnOutside,
  draggable,
  children,
}: ModuleContainerProps) {
  const context = useMapContext();
  const mapId = propsMapId || context.mapId;
  const dragId = propsDragId || context.dragId;

  const [autoTick, setAutoTick] = useState(0);
  useEffect(() => {
    return subscribeControlAutoButton((mid, cid) => {
      if (mid === mapId && (cid === controlId || cid === '*')) {
        setAutoTick((t) => t + 1);
      }
    });
  }, [mapId, controlId]);

  const autoEntry = useMemo(() => {
    void autoTick;
    if (btn || !mapId || !controlId) return undefined;
    return getControlAutoButton(mapId, controlId);
  }, [autoTick, btn, mapId, controlId]);

  const autoState = useMemo(() => {
    void autoTick;
    return autoEntry?.getUiState() as MapControlButtonUIState | undefined;
  }, [autoTick, autoEntry]);

  const hasBtn = !!btn;
  const hasAutoBtn = !hasBtn && !!autoEntry && !!autoState;
  const hasBtnOutside = !!btnOutside;
  const hasCornerChrome = hasBtn || hasAutoBtn || hasBtnOutside;
  const showCornerChrome = isModuleCornerChromeVisible(controlLayout);
  const hasDraggable = !!draggable;

  const containerId = useMemo(() => dragId, [dragId]);

  const btnSelector = useMemo(
    () => (mapId ? moduleCornerHostSelector(position, mapId) : null),
    [position, mapId],
  );
  const draggableSelector = useMemo(
    () => (mapId ? moduleDraggableHostSelector(mapId) : null),
    [mapId],
  );

  const bindDrag = useMemo<BindPosition>(
    () =>
      buildModuleBindPosition({
        position,
        btnWidth,
        containerId,
      }),
    [containerId, btnWidth, position],
  );

  const needBtnHost =
    controlVisible && hasCornerChrome && showCornerChrome && !!btnSelector;
  const needDragHost = !!containerId && hasDraggable && !!draggableSelector;

  const btnPortalTarget = useModuleHostElement(
    needBtnHost ? btnSelector : null,
  );
  const draggablePortalTarget = useModuleHostElement(
    needDragHost ? draggableSelector : null,
  );

  const btnClassName = moduleBtnContainerClassName(controlId);

  const btnContent = hasBtn ? (
    btn
  ) : hasAutoBtn ? (
    <MapCommonButton
      option={autoState!}
      onClick={(e) => {
        e.stopPropagation();
        autoEntry?.onAction(e);
      }}
    />
  ) : null;

  return (
    <div className="module__container">
      {needBtnHost && btnPortalTarget
        ? createPortal(
            <>
              {btnContent ? (
                <div
                  className={btnClassName}
                  style={{ order: controlOrder }}
                  data-map-control-id={controlId || undefined}
                >
                  {btnContent}
                </div>
              ) : null}
              {btnOutside}
            </>,
            btnPortalTarget,
          )
        : null}
      {children}
      {needDragHost && draggablePortalTarget && draggable
        ? createPortal(draggable(bindDrag), draggablePortalTarget)
        : null}
    </div>
  );
}
