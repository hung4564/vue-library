import type {
  AnyToolbarOptions,
  AnyToolbarStrategy,
  ControlStrategy,
  MapControlButtonUIState,
  ModuleStrategy,
  ToolbarButtonConfig,
  ToolbarModuleOptions,
  ToolbarSingleOptions,
  ToolbarStrategyDef,
  WithToolbar,
} from './types';

export function createSubscribable<T>() {
  const subscribers = new Set<(state: T) => void>();
  function notify(state: T) {
    subscribers.forEach((fn) => fn(state));
  }
  function subscribe(fn: (s: T) => void) {
    subscribers.add(fn);
    return () => subscribers.delete(fn);
  }
  return { subscribe, notify };
}

export function createToolbarControl(
  options: ToolbarButtonConfig & WithToolbar,
) {
  const { id, toolbar, getState, onClick } = options;
  const { subscribe, notify } = createSubscribable<MapControlButtonUIState>();
  async function onAction(e: MouseEvent) {
    await onClick?.(e);
    sync();
  }
  function getSnapshot(state: MapControlButtonUIState) {
    return {
      id,
      visible: true,
      ...state,
      action(e: MouseEvent) {
        onAction(e);
      },
      order: state.order ?? 0,
    };
  }

  function mount() {
    const state = getState();
    notify(state);
    toolbar.register(getSnapshot(state));
  }

  function sync() {
    const state = getState();
    toolbar.update(id, {
      ...state,
      order: state.order ?? 0,
    });
    notify(state);
  }

  function unmount() {
    toolbar.unregister(id);
  }

  return { id, mount, sync, unmount, onAction, getSnapshot, subscribe };
}

export function createToolbarModule(
  options: {
    moduleId: string;
    order?: number;
    orientation?: 'row' | 'column';
    toolbar: WithToolbar['toolbar'];
    buttons: ToolbarButtonConfig[];
  } & WithToolbar,
) {
  const { subscribe, notify } =
    createSubscribable<Record<string, MapControlButtonUIState>>();
  function buttonLayout(btn: ToolbarButtonConfig) {
    const state = btn.getState();
    return {
      state,
      patch: {
        group: options.moduleId,
        order: options.order ?? 0,
        orientation: options.orientation ?? 'column',
      },
    };
  }

  function mount() {
    const states: Record<string, MapControlButtonUIState> = {};
    options.buttons.forEach((btn) => {
      const { state, patch } = buttonLayout(btn);
      states[btn.id] = state;
      options.toolbar.register({
        ...state,
        id: `${options.moduleId}:${btn.id}`,
        visible: state.visible ?? true,
        action: (e) => btn.onClick?.(e),
        ...patch,
      });
    });
    notify(states);
  }

  function sync() {
    const states: Record<string, MapControlButtonUIState> = {};
    options.buttons.forEach((btn) => {
      const { state, patch } = buttonLayout(btn);
      states[btn.id] = state;
      options.toolbar.update(`${options.moduleId}:${btn.id}`, {
        ...state,
        ...patch,
      });
    });
    notify(states);
  }

  function unmount() {
    options.buttons.forEach((btn) => {
      options.toolbar.unregister(`${options.moduleId}:${btn.id}`);
    });
  }

  async function onAction(id: string, e: MouseEvent) {
    await options.buttons.find((x) => x.id === id)?.onClick?.(e);
    sync();
  }
  return { mount, sync, unmount, subscribe, onAction };
}

function createSingleStrategy(
  options: ToolbarSingleOptions & WithToolbar,
): ControlStrategy {
  const { kind, ...rest } = options;
  return {
    ...createToolbarControl(rest),
  };
}

function createModuleStrategy(
  options: ToolbarModuleOptions & WithToolbar,
): ModuleStrategy {
  const { kind, ...rest } = options;
  return {
    moduleId: options.moduleId,
    ...createToolbarModule(rest),
  };
}

export const TOOLBAR_STRATEGIES = {
  single: {
    kind: 'single',
    create: createSingleStrategy,
  } as ToolbarStrategyDef<ToolbarSingleOptions, ControlStrategy>,
  module: {
    kind: 'module',
    create: createModuleStrategy,
  } as ToolbarStrategyDef<ToolbarModuleOptions, ModuleStrategy>,
} as const;

export type ToolbarKind = keyof typeof TOOLBAR_STRATEGIES;

export function createToolbarStrategy(
  options: AnyToolbarOptions & WithToolbar & { kind?: ToolbarKind },
): AnyToolbarStrategy {
  const kind: ToolbarKind = (options.kind ?? 'single') as ToolbarKind;
  const strategy = TOOLBAR_STRATEGIES[kind];
  return strategy.create(options as any);
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
};

export function createDefaultToolbarStore(): MapToolbarStore {
  return {
    buttons: new Map(),
    listeners: new Set<Listener>(),
  };
}

export function createToolbarStoreApi(store: MapToolbarStore) {
  function subscribe(fn: Listener) {
    store.listeners.add(fn);
    return () => store.listeners.delete(fn);
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
    notify();
  }

  function getAll() {
    return Array.from(store.buttons.values()).sort(compareToolbarButtons);
  }

  function get(id: string) {
    return store.buttons.get(id);
  }
  return { subscribe, register, unregister, update, getAll, get, notify };
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
