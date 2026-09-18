import {
  buildMapControlHandle,
  type MapControlAction,
  type MapControlHandle,
  type MapControlPanelKind,
  type MapControlPanelPosition,
  type Position,
  MAP_MODULE_CONTROL_ID_KEY,
} from '@hungpvq/map-core';
import {
  computed,
  nextTick,
  onUnmounted,
  provide,
  reactive,
  toValue,
  watch,
  type MaybeRefOrGetter,
  type Ref,
} from 'vue';
import { UniversalRegistry } from './plugin';

export type UseRegisterMapControlOptions = {
  id: string;
  panelKind: MapControlPanelKind;
  title?: MaybeRefOrGetter<string | undefined>;
  buttonPosition?: MaybeRefOrGetter<Position | undefined>;
  getProps?: () => Record<string, unknown>;
  show?: Ref<boolean>;
  setShow?: (value: boolean) => void;
  initialPanelPosition?: MapControlPanelPosition;
  actions?: MaybeRefOrGetter<MapControlAction[]>;
  /** Used when `runAction()` is called without `type` on multi-action controls */
  defaultActionType?: MaybeRefOrGetter<string | undefined>;
};

export function useRegisterMapControl(
  mapId: MaybeRefOrGetter<string>,
  options: UseRegisterMapControlOptions,
) {
  provide(MAP_MODULE_CONTROL_ID_KEY, options.id);

  const panelPosition = reactive<MapControlPanelPosition>({
    ...(options.initialPanelPosition ?? {}),
  });

  function setShow(value: boolean) {
    if (options.setShow) {
      options.setShow(value);
      return;
    }
    if (options.show) options.show.value = value;
  }

  function buildHandle(): MapControlHandle {
    return buildMapControlHandle({
      id: options.id,
      panelKind: options.panelKind,
      title: toValue(options.title),
      buttonPosition: toValue(options.buttonPosition),
      defaultActionType: toValue(options.defaultActionType),
      getProps: options.getProps,
      actions: toValue(options.actions) ?? [],
      isOpen: () => !!options.show?.value,
      setShow,
      getPanelPosition: () => ({ ...panelPosition }),
      setPanelPosition(pos) {
        Object.assign(panelPosition, pos);
        if (options.panelKind === 'popup' || options.panelKind === 'float') {
          if (options.show?.value) {
            setShow(false);
            void nextTick(() => setShow(true));
          }
        }
      },
    });
  }

  let currentMapId = '';

  const stopWatch = watch(
    () => toValue(mapId),
    (id) => {
      if (currentMapId && currentMapId !== id) {
        UniversalRegistry.unregisterControl(currentMapId, options.id);
      }
      currentMapId = id || '';
      if (currentMapId) {
        UniversalRegistry.registerControl(
          currentMapId,
          options.id,
          buildHandle(),
        );
      }
    },
    { immediate: true },
  );

  watch(
    () => [
      toValue(options.title),
      toValue(options.buttonPosition),
      toValue(options.actions),
      toValue(options.defaultActionType),
      options.show?.value,
      { ...panelPosition },
    ],
    () => {
      if (currentMapId) {
        UniversalRegistry.registerControl(
          currentMapId,
          options.id,
          buildHandle(),
        );
      }
    },
    { deep: true },
  );

  onUnmounted(() => {
    stopWatch();
    if (currentMapId) {
      UniversalRegistry.unregisterControl(currentMapId, options.id);
      currentMapId = '';
    }
  });

  const panelBind = computed(() => ({ ...panelPosition }));

  return {
    panelPosition,
    panelBind,
  };
}
