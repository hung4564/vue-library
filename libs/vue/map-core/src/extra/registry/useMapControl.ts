import {
  boundsFromPanelPosition,
  buildMapControlHandle,
  buildPopupPropsForPosition,
  type ButtonInMobile,
  type ControlLayout,
  ensureControlLayout,
  getControlLayout,
  MAP_MODULE_CONTROL_ID_KEY,
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
  type MapControlButtonState,
  type MapControlButtonUIState,
  type ModuleStrategy,
  type Toolbar,
  type ToolbarKind,
  type ToolbarSingleOptions,
} from '@hungpvq/map-core/toolbar';
import { useDragLayout, useDragStore } from '@hungpvq/vue-draggable';
import {
  computed,
  inject,
  type MaybeRefOrGetter,
  nextTick,
  onMounted,
  onUnmounted,
  provide,
  reactive,
  type Ref,
  ref,
  shallowRef,
  toValue,
  watch,
} from 'vue';

import { useResolvedControlLayout } from '../../hooks/useMap';
import { useLang } from '../lang/hook';
import { useMapToolbarModule } from '../toolbar/store';
import { UniversalRegistry } from './plugin';

export type UseMapControlOptions = {
  id: string;
  panelKind: MapControlPanelKind;
  title?: MaybeRefOrGetter<string | undefined>;
  /**
   * Chrome bag from control props (`WithMapPropType`). Explicit
   * position / order / controlLayout / … fields override `from`.
   * Prefer `from: props` + `order` from `useMap` (auto-order).
   */
  from?: MaybeRefOrGetter<
    | Partial<
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
      >
    | null
    | undefined
  >;
  /** Mount default — runtime layout store overrides. */
  position?: MaybeRefOrGetter<Position | undefined>;
  order?: MaybeRefOrGetter<number | undefined>;
  controlLayout?: MaybeRefOrGetter<ControlLayout | undefined>;
  controlVisible?: MaybeRefOrGetter<boolean | undefined>;
  /** Per-control override; `undefined` inherits Map.buttonInMobile. */
  buttonInMobile?: MaybeRefOrGetter<ButtonInMobile | undefined>;
  getProps?: () => Record<string, unknown>;
  show?: Ref<boolean>;
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
  actions?: MaybeRefOrGetter<MapControlAction[]>;
  defaultActionType?: MaybeRefOrGetter<string | undefined>;
  /** Simple single-button controls (`mdiButtonState` / UI snapshot). */
  getButtonState?: () => MapControlButtonUIState;
  onClick?: (event?: unknown) => void;
  /** Multi-button / module toolbar (overrides getButtonState). */
  toolbar?: MaybeRefOrGetter<AnyToolbarOptions | undefined>;
  /**
   * `auto` — ModuleContainer renders MapCommonButton when no `#btn`.
   * `custom` — author keeps `#btn` / `btn` override.
   * Default: `auto` when getButtonState or single toolbar is set.
   */
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
  const container = useDragStore().container[containerId];
  if (!container || container.width <= 0 || container.height <= 0) {
    return undefined;
  }
  const bounds = useDragLayout(containerId).getItemLayout(controlId)?.bounds;
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
  const store = useDragStore();
  if (!store.container[containerId]) return;
  const container = store.container[containerId];
  if (container.width <= 0 || container.height <= 0) return;
  const dragLayout = useDragLayout(containerId);
  const existing = dragLayout.getItemLayout(controlId)?.bounds;
  const size = {
    width: pos.width ?? existing?.width ?? 200,
    height: pos.height ?? existing?.height ?? 200,
  };
  const bounds = boundsFromPanelPosition(
    pos,
    size,
    {
      width: container.width,
      height: container.height,
    },
    existing,
  );
  dragLayout.setItemLayout(controlId, { bounds });
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

function replacePanelEdges(
  target: MapControlPanelPosition,
  next: MapControlPanelPosition,
) {
  delete target.top;
  delete target.left;
  delete target.right;
  delete target.bottom;
  delete target.location;
  delete target.width;
  delete target.height;
  Object.assign(target, next);
}

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

/**
 * Single author API: register handle + layout store + toolbar strategy + optional auto-button.
 */
export function useMapControl(
  mapId: MaybeRefOrGetter<string>,
  options: UseMapControlOptions,
) {
  provide(MAP_MODULE_CONTROL_ID_KEY, options.id);

  const mapPopupDefaults = inject<
    MaybeRefOrGetter<MapPopupPositionDefaults> | MapPopupPositionDefaults
  >('$map.popupPositionDefaults', {});

  const panelPosition = reactive<MapControlPanelPosition>(
    seedPopupPanelPosition(options.panelKind, {
      position: toValue(options.position),
      from: toValue(options.from),
      initialPanelPosition: options.initialPanelPosition,
      defaultPanelSize: options.defaultPanelSize,
      cornerDefaults: toValue(mapPopupDefaults) ?? {},
    }),
  );

  const layoutTick = ref(0);

  function readMountDefaults(): MapControlLayoutPatch {
    const src = toValue(options.from);
    const orderExplicit = toValue(options.order);
    const orderFrom =
      src?.controlOrder != null && +src.controlOrder > 0
        ? +src.controlOrder
        : 0;
    return {
      visible: toValue(options.controlVisible) ?? src?.controlVisible ?? true,
      position: (toValue(options.position) ||
        src?.position ||
        'bottom-right') as Position,
      order: orderExplicit ?? orderFrom,
      controlLayout: (toValue(options.controlLayout) ||
        src?.controlLayout ||
        'standalone') as ControlLayout,
      buttonInMobile:
        options.buttonInMobile !== undefined
          ? toValue(options.buttonInMobile)
          : src?.buttonInMobile,
    };
  }

  function currentLayout(mid: string): MapControlLayoutState {
    return (
      getControlLayout(mid, options.id) ?? {
        visible: true,
        position: 'bottom-right',
        order: 0,
        controlLayout: 'standalone',
        ...readMountDefaults(),
      }
    );
  }

  const layout = computed((): MapControlLayoutState => {
    layoutTick.value;
    const mid = toValue(mapId);
    if (!mid) {
      return {
        visible: true,
        position: 'bottom-right',
        order: 0,
        controlLayout: 'standalone',
        buttonInMobile:
          toValue(options.buttonInMobile) !== undefined
            ? toValue(options.buttonInMobile)
            : toValue(options.from)?.buttonInMobile,
      };
    }
    return currentLayout(mid);
  });

  const stopLayoutSub = subscribeControlLayout((mid, controlId) => {
    if (
      mid === toValue(mapId) &&
      (controlId === options.id || controlId === '*')
    ) {
      layoutTick.value++;
    }
  });

  const resolvedLayout = useResolvedControlLayout(
    () => layout.value.controlLayout,
    () => layout.value.buttonInMobile,
  );

  function setShow(value: boolean) {
    if (options.setShow) {
      options.setShow(value);
      return;
    }
    if (options.show) options.show.value = value;
  }

  function buildHandle(): MapControlHandle {
    const mid = toValue(mapId);
    return buildMapControlHandle({
      id: options.id,
      panelKind: options.panelKind,
      title: toValue(options.title),
      buttonPosition: layout.value.position,
      defaultActionType: toValue(options.defaultActionType),
      getProps: () => ({
        position: layout.value.position,
        controlLayout: layout.value.controlLayout,
        controlVisible: layout.value.visible,
        controlOrder: layout.value.order,
        buttonInMobile: layout.value.buttonInMobile,
        ...(options.getProps?.() ?? {}),
      }),
      actions: toValue(options.actions) ?? [],
      isOpen: () => !!options.show?.value,
      setShow,
      getPanelPosition: () => {
        let pos: MapControlPanelPosition;
        if (
          (options.panelKind === 'popup' || options.panelKind === 'float') &&
          mid
        ) {
          const fromDrag = readDragBoundsPanelPosition(mid, options.id);
          if (fromDrag) {
            pos = panelEdgesForCorner(fromDrag, layout.value.position);
          } else {
            pos = resolveEffectivePanelPosition({
              panelKind: options.panelKind,
              buttonCorner: layout.value.position,
              overrides: { ...panelPosition },
            });
          }
        } else {
          pos = resolveEffectivePanelPosition({
            panelKind: options.panelKind,
            buttonCorner: layout.value.position,
            overrides: { ...panelPosition },
          });
        }
        if (options.panelKind === 'popup' || options.panelKind === 'float') {
          return {
            ...pos,
            width: pos.width ?? panelPosition.width,
            height: pos.height ?? panelPosition.height,
          };
        }
        return pos;
      },
      setPanelPosition(pos) {
        if (options.panelKind === 'popup' || options.panelKind === 'float') {
          replacePanelEdges(
            panelPosition,
            panelEdgesForCorner(
              { ...panelPosition, ...pos },
              layout.value.position,
            ),
          );
        } else {
          Object.assign(panelPosition, pos);
        }
        const writeBounds = () => {
          if (
            mid &&
            (options.panelKind === 'popup' || options.panelKind === 'float')
          ) {
            writeDragBoundsFromPanelPosition(mid, options.id, {
              ...panelPosition,
            });
          }
        };
        if (
          (options.panelKind === 'popup' || options.panelKind === 'float') &&
          options.show?.value
        ) {
          // Close first so item-popup emitBounds persists old coords, then
          // write the Registry target and re-open (avoids wipe of writeBounds).
          setShow(false);
          void nextTick(() => {
            writeBounds();
            setShow(true);
          });
        } else {
          writeBounds();
        }
      },
      getLayout: () =>
        mid
          ? currentLayout(mid)
          : {
              visible: true,
              position: 'bottom-right' as Position,
              order: 0,
              controlLayout: 'standalone' as ControlLayout,
            },
      setLayout(patch) {
        if (mid) patchControlLayout(mid, options.id, patch);
      },
    });
  }

  function syncControl(mid: string) {
    ensureControlLayout(mid, options.id, readMountDefaults());
    UniversalRegistry.unregisterControl(mid, options.id);
    UniversalRegistry.registerControl(mid, options.id, buildHandle());
  }

  let currentMapId = '';

  const stopWatchMap = watch(
    () => toValue(mapId),
    (id) => {
      if (currentMapId && currentMapId !== id) {
        UniversalRegistry.unregisterControl(currentMapId, options.id);
        unregisterControlAutoButton(currentMapId, options.id);
        removeControlLayout(currentMapId, options.id);
      }
      currentMapId = id || '';
      if (currentMapId) syncControl(currentMapId);
    },
    { immediate: true },
  );

  watch(
    () => {
      const defaults = readMountDefaults();
      return [
        defaults.visible,
        defaults.position,
        defaults.order,
        defaults.controlLayout,
        defaults.buttonInMobile,
      ];
    },
    () => {
      if (!currentMapId) return;
      patchControlLayout(currentMapId, options.id, readMountDefaults());
    },
  );

  watch(
    () => [
      toValue(options.title),
      toValue(options.actions),
      toValue(options.defaultActionType),
      options.show?.value,
      panelPosition.top,
      panelPosition.left,
      panelPosition.right,
      panelPosition.bottom,
      panelPosition.location,
      panelPosition.width,
      panelPosition.height,
      layout.value.position,
      layout.value.visible,
      layout.value.controlLayout,
      layout.value.order,
      layout.value.buttonInMobile,
    ],
    () => {
      if (currentMapId) syncControl(currentMapId);
    },
  );

  const toolbarActive = computed(
    () => !!(toValue(options.toolbar) || options.getButtonState),
  );

  const toolbarOpts = computed((): AnyToolbarOptions => {
    let base: AnyToolbarOptions;
    const explicit = toValue(options.toolbar);
    if (explicit) {
      base = explicit;
    } else if (options.getButtonState) {
      base = {
        kind: 'single',
        id: options.id,
        getState: options.getButtonState,
        onClick: options.onClick,
      } satisfies ToolbarSingleOptions;
    } else {
      base = stubToolbarOptions(options.id);
    }
    return withLayoutToolbarOptions(base, () => layout.value);
  });

  const buttonSlotMode = computed<'auto' | 'custom' | 'none'>(() => {
    if (!toolbarActive.value) return 'none';
    if (options.buttonSlot === 'custom') return 'custom';
    if (options.buttonSlot === 'auto') return 'auto';
    if ((toolbarOpts.value.kind ?? 'single') === 'single') return 'auto';
    return 'none';
  });

  const layoutForToolbar = useResolvedControlLayout(
    () => layout.value.controlLayout,
    () => layout.value.buttonInMobile,
  );

  // useMapToolbarModule needs a stable mapId string — watch remounts via layout
  const mapIdRef = computed(() => toValue(mapId) || '');
  const toolbarBase = useMapToolbarModule(
    mapIdRef.value || '__pending__',
    () => layoutForToolbar.value,
  );

  watch(mapIdRef, () => {
    // store module is keyed by mapId; remount strategy when map changes
    remountStrategy();
  });

  const toolbar = withPosition(toolbarBase, () => layout.value.position);

  const optionsRef = shallowRef<AnyToolbarOptions>(toolbarOpts.value);
  watch(
    toolbarOpts,
    (next) => {
      optionsRef.value = next;
    },
    { deep: true },
  );

  const kind: ToolbarKind = (toolbarOpts.value.kind ?? 'single') as ToolbarKind;
  const controlStrategy = createLiveToolbarStrategy(
    () => optionsRef.value,
    toolbar,
    kind,
  );

  type StateType =
    | MapControlButtonUIState
    | Record<string, MapControlButtonUIState>
    | undefined;
  const state = ref<StateType>();

  let unsubscribeState: (() => void) | undefined;

  function remountStrategy() {
    unsubscribeState?.();
    unsubscribeState = undefined;
    controlStrategy.unmount();
    if (!toolbarActive.value || !mapIdRef.value) {
      state.value = undefined;
      return;
    }
    unsubscribeState = controlStrategy.subscribe((s) => {
      state.value = s as StateType;
    });
    controlStrategy.mount();
  }

  onMounted(() => {
    remountStrategy();
  });

  watch(layoutForToolbar, () => {
    remountStrategy();
  });

  watch(
    () => [
      layout.value.position,
      layout.value.order,
      layout.value.visible,
      layout.value.buttonInMobile,
      toolbarActive.value,
    ],
    () => {
      if (toolbarActive.value) {
        remountStrategy();
        controlStrategy.sync();
      }
    },
  );

  const { language } = useLang(toValue(mapId) || 'default');
  watch(language, () => {
    if (toolbarActive.value) controlStrategy.sync();
  });

  function syncAutoButton(mid: string) {
    if (buttonSlotMode.value !== 'auto') {
      unregisterControlAutoButton(mid, options.id);
      return;
    }
    registerControlAutoButton(mid, options.id, {
      getUiState: () => state.value,
      onAction: (event?: unknown) => {
        (controlStrategy as ControlStrategy).onAction?.(event);
      },
    });
  }

  watch(
    () => [mapIdRef.value, buttonSlotMode.value, state.value] as const,
    ([mid]) => {
      if (mid) {
        syncAutoButton(mid);
        notifyControlAutoButton(mid, options.id);
      }
    },
    { immediate: true, deep: true },
  );

  onUnmounted(() => {
    stopWatchMap();
    stopLayoutSub();
    unsubscribeState?.();
    controlStrategy.unmount();
    if (currentMapId) {
      UniversalRegistry.unregisterControl(currentMapId, options.id);
      unregisterControlAutoButton(currentMapId, options.id);
      removeControlLayout(currentMapId, options.id);
      currentMapId = '';
    }
  });

  const panelBind = computed(() => {
    const popupProps = toValue(options.from)?.popupProps;
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
  });

  const moduleContainerProps = computed(() => ({
    mapId: mapIdRef.value,
    position: layout.value.position,
    controlVisible: layout.value.visible,
    controlLayout: resolvedLayout.value,
    controlId: options.id,
    controlOrder: layout.value.order,
  }));

  return {
    panelPosition,
    panelBind,
    layout,
    resolvedLayout,
    state,
    control: controlStrategy as ControlStrategy & ModuleStrategy,
    moduleContainerProps,
  };
}
