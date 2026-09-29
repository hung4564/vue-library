import {
  boundsFromPanelPosition,
  buildMapControlHandle,
  buildPopupPropsForPosition,
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
  type MapPopupPanelPosition,
  type MapPopupPositionDefaults,
  type MapPopupProps,
  type MapSidebarPanelPosition,
  moduleDraggableHostId,
  notifyControlAutoButton,
  panelEdgesForCorner,
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
  ensureMapToolbarApi,
  type MapControlButtonState,
  type MapControlButtonUIState,
  type Toolbar,
  type ToolbarOptionsSingle,
  withLayoutToolbarOptions,
} from '@hungpvq/map-core/toolbar';
import {
  useDragLayout as getDragLayout,
  useDragStore as getDragStore,
} from '@hungpvq/react-draggable';
import {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import { MapContext } from '../../context/MapContext';
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
      | 'popupProps'
      | 'btnWidth'
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
  /**
   * Explicit panel seed.
   * - popup/float: edges (+ optional width/height) merged mid-layer before `from.popupProps`
   * - sidebar: `{ location }` only — no corner table
   */
  initialPanelPosition?: MapControlPanelPosition;
  /**
   * Default popup/float size seeded into panel position and exposed via `panelBind`.
   * Do not also set `:width` / `:height` on the popup — use this only.
   */
  defaultPanelSize?: { width?: number; height?: number };
  actions?: MapControlAction[];
  defaultActionType?: string;
  getButtonState?: () => MapControlButtonUIState;
  onClick?: (event?: unknown) => void;
  toolbar?: AnyToolbarOptions;
  buttonSlot?: 'auto' | 'custom';
};

function pickPanelEdges(
  p?: MapPopupPanelPosition | MapPopupProps | null,
): MapPopupPanelPosition {
  if (!p) return {};
  const out: MapPopupPanelPosition = {};
  if (p.top != null) out.top = p.top;
  if (p.left != null) out.left = p.left;
  if (p.right != null) out.right = p.right;
  if (p.bottom != null) out.bottom = p.bottom;
  return out;
}

function pickPanelSize(
  p?: { width?: number; height?: number } | null,
): Pick<MapControlPanelPosition, 'width' | 'height'> {
  if (!p) return {};
  return {
    ...(p.width != null ? { width: p.width } : {}),
    ...(p.height != null ? { height: p.height } : {}),
  };
}

function seedPopupPanelPosition(
  panelKind: MapControlPanelKind,
  options: {
    position?: Position;
    from?: Partial<
      Pick<WithMapPropType, 'position' | 'popupProps' | 'btnWidth'>
    > | null;
    initialPanelPosition?: MapControlPanelPosition;
    defaultPanelSize?: { width?: number; height?: number };
    cornerDefaults?: MapPopupPositionDefaults;
  },
): MapControlPanelPosition {
  if (panelKind !== 'popup' && panelKind !== 'float') {
    return {
      ...((options.initialPanelPosition as MapSidebarPanelPosition) ?? {}),
    };
  }
  const src = options.from;
  const corner = (options.position ||
    src?.position ||
    'bottom-right') as Position;
  const edges = buildPopupPropsForPosition(
    corner,
    {
      ...pickPanelEdges(options.initialPanelPosition),
      ...pickPanelEdges(src?.popupProps),
    },
    {
      btnWidth: src?.btnWidth,
      cornerDefaults: options.cornerDefaults,
    },
  );
  return {
    ...edges,
    ...pickPanelSize(options.defaultPanelSize),
    ...pickPanelSize(options.initialPanelPosition),
    ...pickPanelSize(src?.popupProps),
  };
}

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

function stubToolbarOptions(id: string): ToolbarOptionsSingle {
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
    width: pos.width ?? existing?.width ?? 200,
    height: pos.height ?? existing?.height ?? 200,
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
  const mapContext = useContext(MapContext);
  const [panelPosition, setPanelPositionState] =
    useState<MapControlPanelPosition>(() =>
      seedPopupPanelPosition(options.panelKind, {
        position: options.position,
        from: options.from,
        initialPanelPosition: options.initialPanelPosition,
        defaultPanelSize: options.defaultPanelSize,
        cornerDefaults: mapContext?.popupPositionDefaults ?? {},
      }),
    );
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
          let pos: MapControlPanelPosition;
          if (opts.panelKind === 'popup' || opts.panelKind === 'float') {
            const fromDrag = readDragBoundsPanelPosition(mapId, opts.id);
            if (fromDrag) {
              pos = panelEdgesForCorner(fromDrag, lay.position);
            } else {
              pos = resolveEffectivePanelPosition({
                panelKind: opts.panelKind,
                buttonCorner: lay.position,
                overrides: { ...panelPositionRef.current },
              });
            }
            return {
              ...pos,
              width: pos.width ?? panelPositionRef.current.width,
              height: pos.height ?? panelPositionRef.current.height,
            };
          }
          return resolveEffectivePanelPosition({
            panelKind: opts.panelKind,
            buttonCorner: lay.position,
            overrides: { ...panelPositionRef.current },
          });
        },
        setPanelPosition(pos) {
          const apply = (prev: MapControlPanelPosition) => {
            const next =
              opts.panelKind === 'popup' || opts.panelKind === 'float'
                ? panelEdgesForCorner({ ...prev, ...pos }, lay.position)
                : { ...prev, ...pos };
            panelPositionRef.current = next;
            return next;
          };
          if (opts.panelKind === 'popup' || opts.panelKind === 'float') {
            if (optionsRef.current.show) {
              // Close first so item-popup can persist old bounds, then write
              // Registry target and re-open (avoids wipe of writeBounds).
              setShow(false);
              queueMicrotask(() => {
                setPanelPositionState((prev) => {
                  const next = apply(prev);
                  writeDragBoundsFromPanelPosition(mapId, opts.id, next);
                  return next;
                });
                setShow(true);
              });
            } else {
              setPanelPositionState((prev) => {
                const next = apply(prev);
                writeDragBoundsFromPanelPosition(mapId, opts.id, next);
                return next;
              });
            }
            return;
          }
          setPanelPositionState((prev) => apply(prev));
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

  const mapIdForExpandRef = useRef(mapId);
  mapIdForExpandRef.current = mapId;

  const toolbarRef = useRef(toolbar);
  toolbarRef.current = toolbar;

  const [control] = useState(() =>
    createLiveToolbarStrategy(
      () => optionsToolbarRef.current,
      {
        register: (state) => toolbarRef.current.register(state),
        update: (id, patch) => toolbarRef.current.update(id, patch),
        unregister: (id) => toolbarRef.current.unregister(id),
      },
      {
        getExpandedModuleId: () => {
          const id = mapIdForExpandRef.current;
          return id ? ensureMapToolbarApi(id).getExpandedModuleId() : null;
        },
      },
    ),
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

  const panelBind = useMemo(() => {
    const popupProps = options.from?.popupProps;
    return {
      id: options.id,
      ...panelPosition,
      ...(panelPosition.width == null && popupProps?.width != null
        ? { width: popupProps.width }
        : {}),
      ...(panelPosition.height == null && popupProps?.height != null
        ? { height: popupProps.height }
        : {}),
    };
  }, [options.id, options.from?.popupProps, panelPosition]);

  return {
    panelPosition,
    setPanelPosition,
    panelBind,
    layout,
    resolvedLayout,
    state,
    control: control,
    moduleContainerProps,
  };
}
