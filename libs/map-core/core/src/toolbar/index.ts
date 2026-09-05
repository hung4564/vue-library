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
} from '../types';

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
    };
  }

  function mount() {
    const state = getState();
    notify(state);
    toolbar.register(getSnapshot(state));
  }

  function sync() {
    const state = getState();
    toolbar.update(id, state);
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
    moduleOrder?: number;
    toolbar: WithToolbar['toolbar'];
    buttons: ToolbarButtonConfig[];
  } & WithToolbar,
) {
  const { subscribe, notify } =
    createSubscribable<Record<string, MapControlButtonUIState>>();
  function mount() {
    const states: Record<string, MapControlButtonUIState> = {};
    options.buttons.forEach((btn) => {
      const state = btn.getState();
      states[btn.id] = state;
      options.toolbar.register({
        id: `${options.moduleId}:${btn.id}`,
        visible: true,
        action: (e) => btn.onClick?.(e),
        group: options.moduleId,
        priority: options.moduleOrder || 0,
        order: btn.order,
        ...state,
      });
    });
    notify(states);
  }

  function sync() {
    const states: Record<string, MapControlButtonUIState> = {};
    options.buttons.forEach((btn) => {
      const state = btn.getState();
      states[btn.id] = state;
      options.toolbar.update(`${options.moduleId}:${btn.id}`, {
        group: options.moduleId,
        priority: options.moduleOrder || 0,
        order: btn.order,
        ...state,
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

export type Listener = () => void;

export type MapToolbarStore = {
  buttons: Map<string, import('../types').MapControlButtonState>;
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

  function register(state: import('../types').MapControlButtonState) {
    store.buttons.set(state.id, state);
    notify();
  }

  function update(
    id: string,
    patch: Partial<import('../types').MapControlButtonState>,
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
    return Array.from(store.buttons.values()).sort((a, b) => {
      const pa = a.priority ?? 0;
      const pb = b.priority ?? 0;
      if (pa !== pb) return pa - pb;

      const ga = a.group ?? '';
      const gb = b.group ?? '';
      if (ga !== gb) return ga.localeCompare(gb);

      return (a.order ?? 0) - (b.order ?? 0);
    });
  }

  function get(id: string) {
    return store.buttons.get(id);
  }
  return { subscribe, register, unregister, update, getAll, get, notify };
}

export function createToolbarModuleApi(
  store: MapToolbarStore,
  controlLayout: 'standalone' | 'toolbar' | undefined,
) {
  function notify() {
    store.listeners.forEach((fn) => fn());
  }

  function register(state: import('../types').MapControlButtonState) {
    if (controlLayout == 'toolbar') {
      store.buttons.set(state.id, state);
    }
    notify();
  }

  function update(
    id: string,
    patch: Partial<import('../types').MapControlButtonState>,
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
  return { register, unregister, update };
}
