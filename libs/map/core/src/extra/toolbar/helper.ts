import { onMounted, onUnmounted, ref } from 'vue';
import { WithMapPropType } from '../../hooks';
import { MapControlButtonUIState, useMapToolbarModule } from './store';
import {
  AnyToolbarOptions,
  AnyToolbarStrategy,
  ControlStrategy,
  ModuleStrategy,
  Toolbar,
  ToolbarModuleOptions,
  ToolbarSingleOptions,
  ToolbarStrategyDef,
  WithToolbar,
} from './types';

export type ToolbarButtonConfig = {
  id: string;
  getState: () => MapControlButtonUIState;
  order?: number; // thứ tự trong group
  onClick?: (e: MouseEvent) => void;
};
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
    toolbar: Toolbar;
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
      options.toolbar.update(`${options.moduleId}:${btn.id}`, state);
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
const STRATEGIES = {
  single: {
    kind: 'single',
    create: createSingleStrategy,
  } as ToolbarStrategyDef<ToolbarSingleOptions, ControlStrategy>,
  module: {
    kind: 'module',
    create: createModuleStrategy,
  } as ToolbarStrategyDef<ToolbarModuleOptions, ModuleStrategy>,
} as const;

type ToolbarKind = keyof typeof STRATEGIES;

export function useInitToolbarControl<T extends AnyToolbarStrategy>(
  control: T,
) {
  type StateType = T extends ControlStrategy
    ? MapControlButtonUIState
    : Record<string, MapControlButtonUIState>;

  const state = ref<StateType>();

  let unsubscribe: (() => void) | undefined;

  onMounted(() => {
    unsubscribe = control.subscribe((s) => {
      state.value = s as StateType;
    });
    control.mount();
  });

  onUnmounted(() => {
    unsubscribe?.();
    control.unmount();
  });

  return { state };
}
type ToolbarSingleOptionsControl = {
  controlLayout: WithMapPropType['controlLayout'];
};
export function useToolbarControl(
  mapId: string,
  opts: ToolbarSingleOptionsControl,
  options: ToolbarModuleOptions,
): { control: ModuleStrategy; state: Record<string, MapControlButtonUIState> };
export function useToolbarControl(
  mapId: string,
  opts: ToolbarSingleOptionsControl,
  options: ToolbarSingleOptions,
): { control: ControlStrategy; state: MapControlButtonUIState };
export function useToolbarControl(
  mapId: string,
  opts: ToolbarSingleOptionsControl,
  options: AnyToolbarOptions,
): { control: AnyToolbarStrategy; state: any } {
  const toolbar = useMapToolbarModule(mapId, opts.controlLayout);

  const kind: ToolbarKind = (options.kind ?? 'single') as ToolbarKind;
  const strategy = STRATEGIES[kind];

  // gắn toolbar và kind vào options
  const optionsWithToolbar = { ...options, toolbar, kind } as any;

  const control = strategy.create(optionsWithToolbar);

  const { state } = useInitToolbarControl(control);

  return { state, control };
}
