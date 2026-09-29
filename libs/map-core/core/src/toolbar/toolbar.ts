import {
  type FlatToolbarButton,
  flatToolbarShortKey,
  normalizeToolbarSpec,
} from './normalize';
import type {
  AnyToolbarOptions,
  AnyToolbarStrategy,
  MapControlButtonState,
  MapControlButtonUIState,
  Toolbar,
  ToolbarOptionsModule,
  ToolbarOptionsModuleExpandable,
  ToolbarOptionsSingle,
} from './types';

export function createSubscribable<T>() {
  const subscribers = new Set<(state: T) => void>();
  function notify(state: T) {
    subscribers.forEach((fn) => fn(state));
  }
  function subscribe(fn: (s: T) => void) {
    subscribers.add(fn);
    return () => {
      subscribers.delete(fn);
    };
  }
  return { subscribe, notify };
}

/** Shared mount/sync/unmount for a flat button list (all kinds). */
export function createFromFlatButtons(options: {
  toolbar: Toolbar;
  getButtons: () => FlatToolbarButton[];
}) {
  const { subscribe, notify } =
    createSubscribable<Record<string, MapControlButtonUIState>>();
  let mountedIds: string[] = [];

  function toStoreState(btn: FlatToolbarButton): MapControlButtonState {
    const state = btn.getState();
    return {
      ...state,
      id: btn.id,
      visible: state.visible ?? true,
      order: state.order ?? 0,
      action(e: MouseEvent) {
        btn.onClick?.(e);
      },
    };
  }

  function sync() {
    const buttons = options.getButtons();
    const nextIds = buttons.map((b) => b.id);
    const nextSet = new Set(nextIds);

    for (const id of mountedIds) {
      if (!nextSet.has(id)) options.toolbar.unregister(id);
    }

    const states: Record<string, MapControlButtonUIState> = {};
    const prevSet = new Set(mountedIds);
    for (const btn of buttons) {
      const snap = toStoreState(btn);
      states[flatToolbarShortKey(btn.id)] = btn.getState();
      if (prevSet.has(btn.id)) {
        options.toolbar.update(btn.id, snap);
      } else {
        options.toolbar.register(snap);
      }
    }
    mountedIds = nextIds;
    notify(states);
  }

  function mount() {
    mountedIds = [];
    sync();
  }

  function unmount() {
    for (const id of mountedIds) options.toolbar.unregister(id);
    mountedIds = [];
  }

  async function onAction(...args: unknown[]) {
    const id = args[0] as string;
    const e = args[1] as MouseEvent;
    const buttons = options.getButtons();
    const hit = buttons.find(
      (b) => b.id === id || flatToolbarShortKey(b.id) === id,
    );
    await hit?.onClick?.(e);
    sync();
  }

  return { mount, sync, unmount, subscribe, onAction };
}

export type LiveToolbarStrategyContext = {
  getExpandedModuleId?: () => string | null;
};

/**
 * Always reads latest options via `getOptions` (Vue/React refs).
 * Kind comes from options — no separate kind argument.
 */
export function createLiveToolbarStrategy(
  getOptions: () => AnyToolbarOptions,
  toolbar: Toolbar,
  ctx: LiveToolbarStrategyContext = {},
): AnyToolbarStrategy {
  const flatApi = createFromFlatButtons({
    toolbar,
    getButtons: () =>
      normalizeToolbarSpec(getOptions(), {
        isExpanded: (moduleId) => ctx.getExpandedModuleId?.() === moduleId,
      }),
  });

  const singleSub = createSubscribable<MapControlButtonUIState>();
  let unsubFlat: (() => void) | undefined;

  function isSingle() {
    return (getOptions().kind ?? 'single') === 'single';
  }

  function bridgeNotify(states: Record<string, MapControlButtonUIState>) {
    if (isSingle()) {
      const opts = getOptions() as ToolbarOptionsSingle;
      singleSub.notify(states[opts.id] ?? opts.getState());
    }
  }

  function mount() {
    unsubFlat?.();
    unsubFlat = flatApi.subscribe(bridgeNotify);
    flatApi.mount();
    if (isSingle()) {
      const opts = getOptions() as ToolbarOptionsSingle;
      singleSub.notify(opts.getState());
    }
  }

  function sync() {
    flatApi.sync();
    if (isSingle()) {
      const opts = getOptions() as ToolbarOptionsSingle;
      singleSub.notify(opts.getState());
    }
  }

  function unmount() {
    flatApi.unmount();
    unsubFlat?.();
    unsubFlat = undefined;
  }

  async function onAction(...args: unknown[]) {
    if (isSingle()) {
      const opts = getOptions() as ToolbarOptionsSingle;
      const e = args[0] as MouseEvent;
      await opts.onClick?.(e);
      sync();
      return;
    }
    await flatApi.onAction(...args);
  }

  function subscribe(fn: (state: any) => void) {
    if (isSingle()) return singleSub.subscribe(fn);
    return flatApi.subscribe(fn);
  }

  const base = { mount, sync, unmount, onAction, subscribe };

  return {
    ...base,
    get id() {
      return (getOptions() as ToolbarOptionsSingle).id;
    },
    get moduleId() {
      return (getOptions() as ToolbarOptionsModule).moduleId;
    },
    get expandableButton() {
      return (getOptions() as ToolbarOptionsModuleExpandable).expandableButton;
    },
  } as AnyToolbarStrategy;
}

function toolbarClusterKey(btn: { id: string; group?: string }) {
  return btn.group || btn.id;
}

function compareToolbarButtons(
  a: { id: string; group?: string; order?: number },
  b: { id: string; group?: string; order?: number },
) {
  const oa = a.order ?? 0;
  const ob = b.order ?? 0;
  if (oa !== ob) return oa - ob;

  const ga = toolbarClusterKey(a);
  const gb = toolbarClusterKey(b);
  if (ga !== gb) return ga.localeCompare(gb);

  return 0;
}

export type Listener = () => void;

export type MapToolbarStore = {
  buttons: Map<string, import('./types').MapControlButtonState>;
  listeners: Set<Listener>;
  /** Expandable module currently open on the secondary toolbar row. */
  expandedModuleId: string | null;
};

export function createDefaultToolbarStore(): MapToolbarStore {
  return {
    buttons: new Map(),
    listeners: new Set<Listener>(),
    expandedModuleId: null,
  };
}

export function createToolbarStoreApi(store: MapToolbarStore) {
  function subscribe(fn: Listener) {
    store.listeners.add(fn);
    return () => {
      store.listeners.delete(fn);
    };
  }

  function notify() {
    store.listeners.forEach((fn) => fn());
  }

  function register(state: import('./types').MapControlButtonState) {
    store.buttons.set(state.id, state);
    notify();
  }

  function update(
    id: string,
    patch: Partial<import('./types').MapControlButtonState>,
  ) {
    const btn = store.buttons.get(id);
    if (!btn) return;
    Object.assign(btn, patch);
    notify();
  }

  function unregister(id: string) {
    store.buttons.delete(id);
    if (
      store.expandedModuleId &&
      !Array.from(store.buttons.keys()).some((key) =>
        key.startsWith(`${store.expandedModuleId}:`),
      )
    ) {
      store.expandedModuleId = null;
    }
    notify();
  }

  function getAll() {
    return Array.from(store.buttons.values()).sort(compareToolbarButtons);
  }

  function get(id: string) {
    return store.buttons.get(id);
  }

  function getExpandedModuleId() {
    return store.expandedModuleId;
  }

  function setExpandedModule(id: string | null) {
    if (store.expandedModuleId === id) return;
    store.expandedModuleId = id;
    notify();
  }

  function toggleExpandedModule(id: string) {
    setExpandedModule(store.expandedModuleId === id ? null : id);
  }

  return {
    subscribe,
    register,
    unregister,
    update,
    getAll,
    get,
    notify,
    getExpandedModuleId,
    setExpandedModule,
    toggleExpandedModule,
  };
}

function isStoreLayout(
  layout: string | undefined,
): layout is 'toolbar' | 'menu' {
  return layout === 'toolbar' || layout === 'menu';
}

export function createToolbarModuleApi(
  store: MapToolbarStore,
  controlLayout:
    | 'standalone'
    | 'toolbar'
    | 'menu'
    | 'button'
    | undefined
    | (() => 'standalone' | 'toolbar' | 'menu' | 'button' | undefined),
) {
  function readLayout() {
    return typeof controlLayout === 'function'
      ? controlLayout()
      : controlLayout;
  }

  function notify() {
    store.listeners.forEach((fn) => fn());
  }

  function register(state: import('./types').MapControlButtonState) {
    if (isStoreLayout(readLayout())) {
      store.buttons.set(state.id, state);
    } else {
      store.buttons.delete(state.id);
    }
    notify();
  }

  function update(
    id: string,
    patch: Partial<import('./types').MapControlButtonState>,
  ) {
    if (!isStoreLayout(readLayout())) {
      store.buttons.delete(id);
      notify();
      return;
    }
    const btn = store.buttons.get(id);
    if (!btn) return;
    Object.assign(btn, patch);
    notify();
  }

  function unregister(id: string) {
    store.buttons.delete(id);
    notify();
  }
  return { register, unregister, update };
}
