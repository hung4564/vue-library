import { onMounted, onUnmounted, ref, watch } from 'vue';
import { WithMapPropType } from '../../hooks';
import {
  MapControlButtonState,
  MapControlButtonUIState,
  useMapToolbarModule,
} from './store';

type Toolbar = {
  register(state: MapControlButtonState): void;
  update(id: string, patch: Partial<MapControlButtonState>): void;
  unregister(id: string): void;
};
export interface Subscribable<T> {
  subscribe(fn: (state: T) => void): () => void;
}
type ToolbarButtonConfig = {
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
  options: {
    toolbar: Toolbar;
  } & ToolbarButtonConfig,
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

export function createToolbarModule(options: {
  moduleId: string;
  moduleOrder?: number;
  toolbar: Toolbar;
  buttons: ToolbarButtonConfig[];
}) {
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
export function useToolbarModule(
  control: Subscribable<Record<string, MapControlButtonUIState>> & {
    mount: () => void;
    unmount: () => void;
  },
) {
  const state = ref<Record<string, MapControlButtonUIState>>({});

  const unsubscribe = control.subscribe((s) => {
    state.value = s;
  });

  onUnmounted(unsubscribe);

  onMounted(control.mount);
  onUnmounted(control.unmount);
  return {
    state,
  };
}

export function useInitToolbarControl(
  control: Subscribable<MapControlButtonUIState> & {
    mount: () => void;
    unmount: () => void;
  },
) {
  const state = ref<MapControlButtonUIState>();

  const unsubscribe = control.subscribe((s) => {
    state.value = s;
  });

  onUnmounted(unsubscribe);
  onMounted(control.mount);
  onUnmounted(control.unmount);
  return {
    state,
  };
}
export function useToolbarControl(
  mapId: string,
  controlLayout: WithMapPropType['controlLayout'],
  options: ToolbarButtonConfig,
) {
  const toolbar = useMapToolbarModule(mapId, controlLayout);

  const control = createToolbarControl({ ...options, toolbar });

  const { state } = useInitToolbarControl(control);

  return {
    state,
    control,
  };
}
