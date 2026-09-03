import type {
  MapControlAction,
  MapControlHandle,
  MapControlPanelKind,
  MapControlPanelPosition,
  Position,
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
      const actions = opts.actions ?? [];
      const title = opts.title;
      const buttonPosition = opts.buttonPosition;
      const defaultActionType = opts.defaultActionType;

      return {
        id: opts.id,
        panelKind: opts.panelKind,
        title,
        buttonPosition,
        defaultActionType,
        props: {
          panelKind: opts.panelKind,
          buttonPosition,
          title,
          defaultActionType,
          ...(opts.getProps?.() ?? {}),
        },
        actions: actions.map(({ type, title: t }) => ({ type, title: t })),
        isOpen() {
          return !!optionsRef.current.show;
        },
        open() {
          setShow(true);
        },
        close() {
          setShow(false);
        },
        toggle() {
          setShow(!optionsRef.current.show);
        },
        setShow,
        getPanelPosition() {
          return { ...panelPositionRef.current };
        },
        setPanelPosition(pos: MapControlPanelPosition) {
          setPanelPositionState((prev) => ({ ...prev, ...pos }));
          if (opts.panelKind === 'popup' || opts.panelKind === 'float') {
            if (optionsRef.current.show) {
              setShow(false);
              queueMicrotask(() => setShow(true));
            }
          }
        },
        runAction(type?: string, event?: unknown) {
          const current = optionsRef.current;
          const list = current.actions ?? [];
          const map = new Map(list.map((a) => [a.type, a.run]));
          if (!type) {
            if (list.length === 1) {
              list[0].run(event);
              return;
            }
            if (list.length === 0) {
              setShow(!current.show);
              return;
            }
            const preferred = current.defaultActionType || current.id;
            const fallback = map.get(preferred);
            if (fallback) {
              fallback(event);
              return;
            }
            throw new Error(
              `[UniversalRegistry] Control '${current.id}' has multiple actions; pass type or set defaultActionType`,
            );
          }
          const run = map.get(type);
          if (!run) {
            throw new Error(
              `[UniversalRegistry] Control '${current.id}' has no action '${type}'`,
            );
          }
          run(event);
        },
      };
    };

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
