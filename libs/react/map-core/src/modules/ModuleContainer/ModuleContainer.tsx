import React, { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { useMapContext } from '../../context/MapContext';

export interface ModuleContainerProps {
  mapId?: string;
  dragId?: string;
  btnWidth?: number;
  order?: number;
  /** Control id → class `{controlId}-btn-module-container` */
  controlId?: string;
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  controlVisible?: boolean;
  controlLayout?: 'toolbar' | 'standalone';
  top?: number;
  bottom?: number;
  left?: number;
  right?: number;
  btn?: React.ReactNode;
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

export function ModuleContainer({
  mapId: propsMapId,
  dragId: propsDragId,
  btnWidth = 40,
  order = 0,
  controlId = '',
  position = 'bottom-right',
  controlVisible = true,
  controlLayout = 'standalone',
  top,
  bottom,
  left,
  right,
  btn,
  draggable,
  children,
}: ModuleContainerProps) {
  const context = useMapContext();
  const mapId = propsMapId || context.mapId;
  const dragId = propsDragId || context.dragId;

  const hasBtn = !!btn;
  const isStandaloneButton = controlLayout === 'standalone';
  const hasDraggable = !!draggable;

  const containerId = useMemo(() => dragId, [dragId]);

  const draggableTo = useMemo(() => {
    return `#map-draggable-${mapId}`;
  }, [mapId]);

  const btnTo = useMemo(() => {
    return `#${position}-${mapId}`;
  }, [position, mapId]);

  const bindDrag = useMemo<BindPosition>(() => {
    const result: BindPosition = {
      containerId,
    };

    const configs = [
      { key: 'left' as const, fallback: 18 + btnWidth },
      { key: 'right' as const, fallback: 18 + btnWidth },
      { key: 'top' as const, fallback: 10 },
      { key: 'bottom' as const, fallback: 10 },
    ] as const;

    configs.forEach(({ key, fallback }) => {
      const val = { top, bottom, left, right }[key];
      if (val !== undefined) {
        result[key] = val;
      } else if (position.includes(key)) {
        result[key] = fallback;
      }
    });

    return result;
  }, [containerId, btnWidth, top, bottom, left, right, position]);

  const [btnPortalTarget, setBtnPortalTarget] = useState<HTMLElement | null>(
    null,
  );
  const [draggablePortalTarget, setDraggablePortalTarget] =
    useState<HTMLElement | null>(null);

  useEffect(() => {
    if (typeof document === 'undefined') return;

    const findTargets = () => {
      const btnTarget = document.querySelector(btnTo) as HTMLElement;
      const dragTarget = document.querySelector(draggableTo) as HTMLElement;

      if (btnTarget && !btnPortalTarget) {
        setBtnPortalTarget(btnTarget);
      }
      if (dragTarget && !draggablePortalTarget) {
        setDraggablePortalTarget(dragTarget);
      }
    };

    findTargets();
    const timeout1 = setTimeout(findTargets, 10);
    const timeout2 = setTimeout(findTargets, 50);
    const timeout3 = setTimeout(findTargets, 100);
    const timeout4 = setTimeout(findTargets, 200);

    const mapContainer =
      document.querySelector(`[data-map-id="${mapId}"]`) || document.body;
    const observer = new MutationObserver(() => {
      findTargets();
    });

    observer.observe(mapContainer, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['id'],
    });

    return () => {
      clearTimeout(timeout1);
      clearTimeout(timeout2);
      clearTimeout(timeout3);
      clearTimeout(timeout4);
      observer.disconnect();
    };
  }, [btnTo, draggableTo, mapId, btnPortalTarget, draggablePortalTarget]);

  const btnClassName = controlId
    ? `btn-module-container ${controlId}-btn-module-container`
    : 'btn-module-container';

  return (
    <div className="module__container">
      {controlVisible &&
        hasBtn &&
        isStandaloneButton &&
        btnPortalTarget &&
        createPortal(
          <div className={btnClassName} style={{ order }}>
            {btn}
          </div>,
          btnPortalTarget,
        )}
      {children}
      {containerId && hasDraggable && draggablePortalTarget && draggable
        ? createPortal(draggable(bindDrag), draggablePortalTarget)
        : null}
    </div>
  );
}
