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

export type LiveToolbarStrategyContext = {
  getExpandedModuleId?: () => string | null;
  /** Required for `module-expandable` launcher clicks (host or strip). */
  toggleExpandedModule?: (moduleId: string) => void;
};

/**
 * One live strategy for all kinds (`single` | `module` | `module-expandable`).
 * Always re-reads `getOptions` (Vue/React refs). Pass a no-op `Toolbar` for
 * host-only chrome that must not write the strip store.
 */
export function createLiveToolbarStrategy(
  getOptions: () => AnyToolbarOptions,
  toolbar: Toolbar,
  ctx: LiveToolbarStrategyContext = {},
): AnyToolbarStrategy {
  type NotifyState =
    MapControlButtonUIState | Record<string, MapControlButtonUIState>;
  const { subscribe, notify } = createSubscribable<NotifyState>();
  let mountedIds: string[] = [];

  function isSingle() {
    return (getOptions().kind ?? 'single') === 'single';
  }

  function getButtons(): FlatToolbarButton[] {
    return normalizeToolbarSpec(getOptions(), {
      isExpanded: (moduleId) => ctx.getExpandedModuleId?.() === moduleId,
    });
  }

  function toStoreState(btn: FlatToolbarButton): MapControlButtonState {
    const state = btn.getState({ location: 'host' });
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

  function publish(states: Record<string, MapControlButtonUIState>) {
    if (!isSingle()) {
      notify(states);
      return;
    }
    const opts = getOptions() as ToolbarOptionsSingle;
    const id = opts.id;
    notify(
      (id != null ? states[id] : undefined) ??
        opts.getState({ location: 'host' }),
    );
  }

  function sync() {
    const buttons = getButtons();
    const nextIds = buttons.map((b) => b.id);
    const nextSet = new Set(nextIds);

    for (const id of mountedIds) {
      if (!nextSet.has(id)) toolbar.unregister(id);
    }

    const states: Record<string, MapControlButtonUIState> = {};
    const prevSet = new Set(mountedIds);
    for (const btn of buttons) {
      const snap = toStoreState(btn);
      states[flatToolbarShortKey(btn.id)] = btn.getState({
        location: 'toolbar',
      });
      if (prevSet.has(btn.id)) toolbar.update(btn.id, snap);
      else toolbar.register(snap);
    }
    mountedIds = nextIds;
    publish(states);
  }

  function mount() {
    mountedIds = [];
    sync();
  }

  function unmount() {
    for (const id of mountedIds) toolbar.unregister(id);
    mountedIds = [];
  }

  async function onAction(...args: unknown[]) {
    if (isSingle()) {
      const opts = getOptions() as ToolbarOptionsSingle;
      await opts.onClick?.(args[0] as MouseEvent);
      sync();
      return;
    }

    const id = args[0] as string;
    const e = args[1] as MouseEvent | undefined;
    const hit = getButtons().find(
      (b) => b.id === id || flatToolbarShortKey(b.id) === id,
    );
    if (!hit) return;

    const ui = hit.getState({ location: 'host' });
    if (ui.expandable && (ui.role === 'launcher' || !ui.role)) {
      const moduleId = ui.group || hit.id.replace(/:launcher$/, '');
      e?.stopPropagation?.();
      ctx.toggleExpandedModule?.(moduleId);
      sync();
      return;
    }

    await hit.onClick?.(e as MouseEvent);
    sync();
  }

  return { mount, sync, unmount, onAction, subscribe } as AnyToolbarStrategy;
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

  function getAll(props: { location?: 'toolbar' }) {
    switch (props.location) {
      case 'toolbar':
        return Array.from(store.buttons.values())
          .sort(compareToolbarButtons)
          .map((btn) =>
            btn.expandable && (btn.role === 'launcher' || !btn.role)
              ? {
                  ...btn,
                  active: store.expandedModuleId === (btn.group || btn.id),
                }
              : { ...btn },
          );

      default:
        return Array.from(store.buttons.values()).sort(compareToolbarButtons);
    }
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
