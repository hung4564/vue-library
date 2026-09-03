import {
  type AnyToolbarOptions,
  type AnyToolbarStrategy,
  type ControlStrategy,
  type MapControlButtonUIState,
  type ModuleStrategy,
  type ToolbarModuleOptions,
  type ToolbarSingleOptions,
  createToolbarStrategy,
  type ToolbarKind,
  MAP_MODULE_CONTROL_ID_KEY,
} from '@hungpvq/map-core';
import { onMounted, onUnmounted, provide, ref } from 'vue';
import type { WithMapPropType } from '@hungpvq/map-core';
import { useMapToolbarModule } from './store';

export {
  createSubscribable,
  createToolbarControl,
  createToolbarModule,
} from '@hungpvq/map-core';
export type { ToolbarButtonConfig } from '@hungpvq/map-core';

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
  const control = createToolbarStrategy({ ...options, toolbar, kind } as any);

  const controlId =
    kind === 'module'
      ? (options as ToolbarModuleOptions).moduleId
      : (options as ToolbarSingleOptions).id;
  if (controlId) {
    provide(MAP_MODULE_CONTROL_ID_KEY, controlId);
  }

  const { state } = useInitToolbarControl(control);

  return { state, control };
}
