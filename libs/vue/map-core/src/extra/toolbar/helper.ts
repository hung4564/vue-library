import { MAP_MODULE_CONTROL_ID_KEY, type Position } from '@hungpvq/map-core';
import {
  type AnyToolbarOptions,
  type AnyToolbarStrategy,
  type ControlStrategy,
  type MapControlButtonState,
  type MapControlButtonUIState,
  type ModuleStrategy,
  type Toolbar,
  type ToolbarModuleOptions,
  type ToolbarSingleOptions,
  createToolbarStrategy,
  type ToolbarKind,
} from '@hungpvq/map-core/toolbar';
import { onMounted, onUnmounted, provide, ref, watch } from 'vue';
import type { WithMapPropType } from '@hungpvq/map-core';
import { useResolvedControlLayout } from '../../hooks/useMap';
import { useMapToolbarModule } from './store';

export type { ToolbarButtonConfig } from '@hungpvq/map-core/toolbar';

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
  controlOrder: WithMapPropType['controlOrder'];
  position?: WithMapPropType['position'];
};

function withPosition(
  toolbar: Toolbar,
  position: Position | undefined,
): Toolbar {
  if (!position) return toolbar;
  return {
    register(state: MapControlButtonState) {
      toolbar.register({ ...state, position });
    },
    update(id, patch) {
      toolbar.update(id, { ...patch, position });
    },
    unregister(id) {
      toolbar.unregister(id);
    },
  };
}

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
  const layout = useResolvedControlLayout(() => opts.controlLayout);
  const toolbarBase = useMapToolbarModule(mapId, () => layout.value);
  const toolbar = withPosition(
    toolbarBase,
    (opts.position || 'bottom-right') as Position,
  );

  const kind: ToolbarKind = (options.kind ?? 'single') as ToolbarKind;
  const control = createToolbarStrategy({ ...options, toolbar, kind } as any);

  const controlId =
    kind === 'module'
      ? (options as ToolbarModuleOptions).moduleId
      : (options as ToolbarSingleOptions).id;
  if (controlId) {
    provide(MAP_MODULE_CONTROL_ID_KEY, controlId);
  }

  const { state } = useInitToolbarControl(control);

  watch(layout, () => {
    control.unmount();
    control.mount();
  });

  return { state, control };
}
