import {
  buildMapControlHandle,
  type MapControlAction,
  type MapControlHandle,
  type MapControlPanelKind,
  type MapControlPanelPosition,
  type Position,
} from '@hungpvq/map-core';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { UniversalRegistry } from './plugin';

export type UseRegisterMapControlOptions = {
  id: string;
  panelKind: MapControlPanelKind;
  title?: string;
  buttonPosition?: Position;
  getProps?: () => Record<string, unknown>;
  show?: boolean;
  setShow?: (value: boolean) => void;
  initialPanelPosition?: MapControlPanelPosition;
  actions?: MapControlAction[];
  /** Used when `runAction()` is called without `type` on multi-action controls */
  defaultActionType?: string;
};

export function useRegisterMapControl(
  mapId: string,
  options: UseRegisterMapControlOptions,
) {
  const [panelPosition, setPanelPositionState] =
    useState<MapControlPanelPosition>(
      () => ({ ...(options.initialPanelPosition ?? {}) }),
    );

  const optionsRef = useRef(options);
  optionsRef.current = options;
  const panelPositionRef = useRef(panelPosition);
  panelPositionRef.current = panelPosition;

  const setShow = useCallback((value: boolean) => {
    optionsRef.current.setShow?.(value);
  }, []);

  const actionTypesKey = (options.actions ?? []).map((a) => a.type).join(',');

  useEffect(() => {
    if (!mapId) return;

    const buildHandle = (): MapControlHandle => {
      const opts = optionsRef.current;
      return buildMapControlHandle({
        id: opts.id,
        panelKind: opts.panelKind,
        title: opts.title,
        buttonPosition: opts.buttonPosition,
        defaultActionType: opts.defaultActionType,
        getProps: opts.getProps,
        actions: opts.actions ?? [],
        isOpen: () => !!optionsRef.current.show,
        setShow,
        getPanelPosition: () => ({ ...panelPositionRef.current }),
        setPanelPosition(pos) {
          setPanelPositionState((prev) => ({ ...prev, ...pos }));
          if (opts.panelKind === 'popup' || opts.panelKind === 'float') {
            if (optionsRef.current.show) {
              setShow(false);
              queueMicrotask(() => setShow(true));
            }
          }
        },
      });
    };

    // Drop then set so intentional handle refresh does not warn on overwrite.
    UniversalRegistry.unregisterControl(mapId, options.id);
    UniversalRegistry.registerControl(mapId, options.id, buildHandle());
    return () => {
      UniversalRegistry.unregisterControl(mapId, options.id);
    };
  }, [
    mapId,
    options.id,
    options.panelKind,
    options.title,
    options.buttonPosition,
    options.show,
    options.defaultActionType,
    actionTypesKey,
    panelPosition,
    setShow,
  ]);

  const panelBind = useMemo(() => ({ ...panelPosition }), [panelPosition]);

  return {
    panelPosition,
    panelBind,
    setPanelPosition: setPanelPositionState,
  };
}
