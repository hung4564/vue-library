import {
  boundsFromPanelPosition,
  buildMapControlHandle,
  type ButtonInMobile,
  type ControlLayout,
  ensureControlLayout,
  getControlLayout,
  type MapControlAction,
  type MapControlHandle,
  type MapControlLayoutPatch,
  type MapControlLayoutState,
  type MapControlPanelKind,
  type MapControlPanelPosition,
  moduleDraggableHostId,
  notifyControlAutoButton,
  panelPositionFromBounds,
  type Position,
  registerControlAutoButton,
  removeControlLayout,
  resolveEffectivePanelPosition,
  setControlLayout as patchControlLayout,
  subscribeControlLayout,
  unregisterControlAutoButton,
  type WithMapPropType,
} from '@hungpvq/map-core';
import {
  type AnyToolbarOptions,
  type ControlStrategy,
  createLiveToolbarStrategy,
  type MapControlButtonState,
  type MapControlButtonUIState,
  type ModuleStrategy,
  type Toolbar,
  type ToolbarKind,
  type ToolbarSingleOptions,
} from '@hungpvq/map-core/toolbar';
import {
  useDragLayout as getDragLayout,
  useDragStore as getDragStore,
} from '@hungpvq/react-draggable';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { useResolvedControlLayout } from '../../hooks/useMap';
import { useLang } from '../lang/hook';
import { useMapToolbarModule } from '../toolbar/store';
import { UniversalRegistry } from './plugin';

export type UseMapControlOptions = {
  id: string;
  panelKind: MapControlPanelKind;
  title?: string;
  /**
   * Chrome bag from control props (`WithMapPropType`). Explicit
   * position / order / controlLayout / … fields override `from`.
   * Prefer `from: props` + `order` from `useMap` (auto-order).
   */
  from?: Partial<
    Pick<
      WithMapPropType,
      | 'position'
      | 'controlLayout'
      | 'controlVisible'
      | 'buttonInMobile'
      | 'controlOrder'
    >
  > | null;
  position?: Position;
  order?: number;
  controlLayout?: ControlLayout;
  controlVisible?: boolean;
  buttonInMobile?: ButtonInMobile;
  getProps?: () => Record<string, unknown>;
  show?: boolean;
  setShow?: (value: boolean) => void;
  initialPanelPosition?: MapControlPanelPosition;
  actions?: MapControlAction[];
  defaultActionType?: string;
  getButtonState?: () => MapControlButtonUIState;
  onClick?: (event?: unknown) => void;
  toolbar?: AnyToolbarOptions;
  buttonSlot?: 'auto' | 'custom';
};

function withPosition(
  toolbar: Toolbar,
  getPosition: () => Position | undefined,
): Toolbar {
  return {
    register(state: MapControlButtonState) {
      const position = getPosition();
      toolbar.register(position ? { ...state, position } : state);
    },
    update(id, patch) {
      const position = getPosition();
      toolbar.update(id, position ? { ...patch, position } : patch);
    },
    unregister(id) {
      toolbar.unregister(id);
    },
  };
}

function stubToolbarOptions(id: string): ToolbarSingleOptions {
  return {
    kind: 'single',
    id,
    getState: () =>
      ({
        id,
        visible: false,
      }) as MapControlButtonUIState,
  };
}

/** Apply layout SoT onto author button UI state (visible / order / position). */
function applyLayoutToButtonState(
  author: MapControlButtonUIState,
  lay: MapControlLayoutState,
): MapControlButtonUIState {
  return {
    ...author,
    visible: lay.visible && author.visible !== false,
    order: lay.order,
    position: lay.position,
  };
}

/** Wrap toolbar options so sync/mount always read current layout store. */
function withLayoutToolbarOptions(
  opts: AnyToolbarOptions,
  getLayout: () => MapControlLayoutState,
): AnyToolbarOptions {
  if (opts.kind === 'module') {
    return {
      ...opts,
      get order() {
        return getLayout().order;
      },
      buttons: opts.buttons.map((btn) => ({
        ...btn,
        getState: () => applyLayoutToButtonState(btn.getState(), getLayout()),
      })),
    };
  }
  return {
    ...opts,
    getState: () => applyLayoutToButtonState(opts.getState(), getLayout()),
  };
}

function readDragBoundsPanelPosition(
  mapId: string,
  controlId: string,
): MapControlPanelPosition | undefined {
  const containerId = moduleDraggableHostId(mapId);
  // Shared-store accessors (not React hooks) — aliased to avoid rules-of-hooks.
  const container = getDragStore().container[containerId];
  if (!container || container.width <= 0 || container.height <= 0) {
    return undefined;
  }
  const bounds = getDragLayout(containerId).getItemLayout(controlId)?.bounds;
  if (!bounds) return undefined;
  return panelPositionFromBounds(bounds, {
    width: container.width,
    height: container.height,
  });
}

function writeDragBoundsFromPanelPosition(
  mapId: string,
  controlId: string,
  pos: MapControlPanelPosition,
) {
  const containerId = moduleDraggableHostId(mapId);
  const store = getDragStore();
  if (!store.container[containerId]) return;
  const container = store.container[containerId];
  if (container.width <= 0 || container.height <= 0) return;
  const dragLayout = getDragLayout(containerId);
  const existing = dragLayout.getItemLayout(controlId)?.bounds;
  const size = {
    width: existing?.width ?? 200,
    height: existing?.height ?? 200,
  };
  const bounds = boundsFromPanelPosition(
    pos,
    size,
    { width: container.width, height: container.height },
    existing,
  );
  dragLayout.setItemLayout(controlId, { bounds });
}

/**
 * Single author API: register handle + layout store + toolbar strategy + optional auto-button.
 */
export function useMapControl(mapId: string, options: UseMapControlOptions) {
  const [panelPosition, setPanelPositionState] =
    useState<MapControlPanelPosition>(() => ({
      ...(options.initialPanelPosition ?? {}),
    }));
  const [layoutTick, setLayoutTick] = useState(0);

  const optionsRef = useRef(options);
  optionsRef.current = options;
  const panelPositionRef = useRef(panelPosition);
  panelPositionRef.current = panelPosition;

  const readMountDefaults = useCallback((): MapControlLayoutPatch => {
    const opts = optionsRef.current;
    const src = opts.from ?? undefined;
    const orderFrom =
      src?.controlOrder != null && +src.controlOrder > 0
        ? +src.controlOrder
        : 0;
    return {
      visible: opts.controlVisible ?? src?.controlVisible ?? true,
      position: (opts.position || src?.position || 'bottom-right') as Position,
      order: opts.order ?? orderFrom,
      controlLayout: (opts.controlLayout ||
        src?.controlLayout ||
        'standalone') as ControlLayout,
      buttonInMobile: opts.buttonInMobile ?? src?.buttonInMobile,
    };
  }, []);

  const layout = useMemo((): MapControlLayoutState => {
    void layoutTick;
    if (!mapId) {
      return {
        visible: true,
        position: 'bottom-right',
        order: 0,
        controlLayout: 'standalone',
        buttonInMobile: options.buttonInMobile ?? options.from?.buttonInMobile,
      };
    }
    return (
      getControlLayout(mapId, options.id) ?? {
        visible: true,
        position: 'bottom-right',
        order: 0,
        controlLayout: 'standalone',
        ...readMountDefaults(),
      }
    );
  }, [
    layoutTick,
    mapId,
    options.id,
    options.buttonInMobile,
    options.from,
    readMountDefaults,
  ]);

  useEffect(() => {
    return subscribeControlLayout((mid, controlId) => {
      if (mid === mapId && (controlId === options.id || controlId === '*')) {
        setLayoutTick((t) => t + 1);
      }
    });
  }, [mapId, options.id]);

  /** Seed once; only patch when mount props actually change (avoid wiping runtime layout). */
  const prevMountKeyRef = useRef<string | null>(null);
  useEffect(() => {
    prevMountKeyRef.current = null;
  }, [mapId, options.id]);

  useEffect(() => {
    if (!mapId) return;
    const defaults = readMountDefaults();
    const key = JSON.stringify({
      visible: defaults.visible,
      position: defaults.position,
      order: defaults.order,
      controlLayout: defaults.controlLayout,
      buttonInMobile: defaults.buttonInMobile,
    });
    if (prevMountKeyRef.current === null) {
      ensureControlLayout(mapId, options.id, defaults);
      prevMountKeyRef.current = key;
      return;
    }
    if (prevMountKeyRef.current === key) return;
    prevMountKeyRef.current = key;
    patchControlLayout(mapId, options.id, defaults);
  }, [
    mapId,
    options.id,
    options.from,
    options.position,
    options.order,
    options.controlLayout,
    options.controlVisible,
    options.buttonInMobile,
    readMountDefaults,
  ]);

  const resolvedLayout = useResolvedControlLayout(
    layout.controlLayout,
    layout.buttonInMobile,
  );

  const setShow = useCallback((value: boolean) => {
    optionsRef.current.setShow?.(value);
  }, []);

  const actionTypesKey = (options.actions ?? []).map((a) => a.type).join(',');

  useEffect(() => {
    if (!mapId) return;

    const buildHandle = (): MapControlHandle => {
      const opts = optionsRef.current;
      const lay = getControlLayout(mapId, opts.id) ?? {
        visible: true,
        position: 'bottom-right' as Position,
        order: 0,
        controlLayout: 'standalone' as ControlLayout,
        ...readMountDefaults(),
      };
      return buildMapControlHandle({
        id: opts.id,
        panelKind: opts.panelKind,
        title: opts.title,
        buttonPosition: lay.position,
        defaultActionType: opts.defaultActionType,
        getProps: () => ({
          position: lay.position,
          controlLayout: lay.controlLayout,
          controlVisible: lay.visible,
          controlOrder: lay.order,
          buttonInMobile: lay.buttonInMobile,
          ...(opts.getProps?.() ?? {}),
        }),
        actions: opts.actions ?? [],
        isOpen: () => !!optionsRef.current.show,
        setShow,
        getPanelPosition: () => {
          if (opts.panelKind === 'popup' || opts.panelKind === 'float') {
            const fromDrag = readDragBoundsPanelPosition(mapId, opts.id);
            if (fromDrag) return fromDrag;
          }
          return resolveEffectivePanelPosition({
            panelKind: opts.panelKind,
            buttonCorner: lay.position,
            overrides: { ...panelPositionRef.current },
          });
        },
        setPanelPosition(pos) {
          setPanelPositionState((prev) => {
            const next = { ...prev, ...pos };
            if (opts.panelKind === 'popup' || opts.panelKind === 'float') {
              writeDragBoundsFromPanelPosition(mapId, opts.id, next);
            }
            return next;
          });
          if (opts.panelKind === 'popup' || opts.panelKind === 'float') {
            if (optionsRef.current.show) {
              setShow(false);
              queueMicrotask(() => setShow(true));
            }
          }
        },
        getLayout: () =>
          getControlLayout(mapId, opts.id) ?? {
            visible: true,
            position: 'bottom-right',
            order: 0,
            controlLayout: 'standalone',
            ...readMountDefaults(),
          },
        setLayout(patch) {
          patchControlLayout(mapId, opts.id, patch);
        },
      });
    };

    ensureControlLayout(mapId, options.id, readMountDefaults());
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
    options.defaultActionType,
    options.show,
    actionTypesKey,
    panelPosition,
    layout.position,
    layout.visible,
    layout.controlLayout,
    layout.order,
    layout.buttonInMobile,
    setShow,
    readMountDefaults,
  ]);

  useEffect(() => {
    return () => {
      if (!mapId) return;
      unregisterControlAutoButton(mapId, options.id);
      removeControlLayout(mapId, options.id);
    };
  }, [mapId, options.id]);

  const toolbarActive = !!(options.toolbar || options.getButtonState);

  const layoutRef = useRef(layout);
  layoutRef.current = layout;

  const toolbarOptsBase: AnyToolbarOptions = options.toolbar
    ? options.toolbar
    : options.getButtonState
      ? {
          kind: 'single',
          id: options.id,
          getState: options.getButtonState,
          onClick: options.onClick,
        }
      : stubToolbarOptions(options.id);

  const toolbarOpts = withLayoutToolbarOptions(
    toolbarOptsBase,
    () => layoutRef.current,
  );

  const buttonSlotMode: 'auto' | 'custom' | 'none' = !toolbarActive
    ? 'none'
    : options.buttonSlot === 'custom'
      ? 'custom'
      : options.buttonSlot === 'auto' ||
          (toolbarOpts.kind ?? 'single') === 'single'
        ? 'auto'
        : 'none';

  const toolbarBase = useMapToolbarModule(
    mapId || '__pending__',
    () => resolvedLayout,
  );

  const positionRef = useRef(layout.position);
  positionRef.current = layout.position;

  const toolbar = useMemo(
    () => withPosition(toolbarBase, () => positionRef.current),
    [toolbarBase],
  );

  const optionsToolbarRef = useRef(toolbarOpts);
  optionsToolbarRef.current = toolbarOpts;

  const kind: ToolbarKind = (toolbarOpts.kind ?? 'single') as ToolbarKind;

  const [control] = useState(() =>
    createLiveToolbarStrategy(() => optionsToolbarRef.current, toolbar, kind),
  );

  type StateType =
    | MapControlButtonUIState
    | Record<string, MapControlButtonUIState>
    | undefined;
  const [state, setState] = useState<StateType>();

  useEffect(() => {
    if (!toolbarActive || !mapId) {
      setState(undefined);
      return;
    }
    const unsub = control.subscribe((s) => {
      setState(s as StateType);
    });
    control.mount();
    return () => {
      unsub();
      control.unmount();
    };
  }, [control, toolbarActive, mapId, resolvedLayout, layout.position]);

  const { language } = useLang(mapId || 'default');
  useEffect(() => {
    if (toolbarActive) control.sync();
  }, [
    language,
    control,
    toolbarActive,
    layout.order,
    layout.visible,
    layout.position,
  ]);

  useEffect(() => {
    if (!mapId) return;
    if (buttonSlotMode !== 'auto') {
      unregisterControlAutoButton(mapId, options.id);
      return;
    }
    registerControlAutoButton(mapId, options.id, {
      getUiState: () => state,
      onAction: (event?: unknown) => {
        (control as ControlStrategy).onAction?.(event);
      },
    });
    notifyControlAutoButton(mapId, options.id);
  }, [mapId, options.id, buttonSlotMode, state, control]);

  const moduleContainerProps = useMemo(
    () => ({
      mapId,
      position: layout.position,
      controlVisible: layout.visible,
      controlLayout: resolvedLayout,
      controlId: options.id,
      controlOrder: layout.order,
    }),
    [mapId, layout, resolvedLayout, options.id],
  );

  const setPanelPosition = useCallback((pos: MapControlPanelPosition) => {
    setPanelPositionState((prev) => ({ ...prev, ...pos }));
  }, []);

  const panelBind = useMemo(
    () => ({
      id: options.id,
      ...panelPosition,
    }),
    [options.id, panelPosition],
  );

  return {
    panelPosition,
    setPanelPosition,
    panelBind,
    layout,
    resolvedLayout,
    state,
    control: control as ControlStrategy & ModuleStrategy,
    moduleContainerProps,
  };
}
