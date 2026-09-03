import type {
  MapControlAction,
  MapControlHandle,
  MapControlPanelKind,
  MapControlPanelPosition,
  Position,
} from '@hungpvq/map-core';
import { MAP_MODULE_CONTROL_ID_KEY } from '@hungpvq/map-core';
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

  const actionMap = new Map<string, MapControlAction['run']>();

  function syncActionMap(list: MapControlAction[]) {
    actionMap.clear();
    for (const action of list) {
      actionMap.set(action.type, action.run);
    }
  }

  function setShow(value: boolean) {
    if (options.setShow) {
      options.setShow(value);
      return;
    }
    if (options.show) options.show.value = value;
  }

  function buildHandle(): MapControlHandle {
    const actions = toValue(options.actions) ?? [];
    syncActionMap(actions);
    const title = toValue(options.title);
    const buttonPosition = toValue(options.buttonPosition);
    const defaultActionType = toValue(options.defaultActionType);

    return {
      id: options.id,
      panelKind: options.panelKind,
      title,
      buttonPosition,
      defaultActionType,
      props: {
        panelKind: options.panelKind,
        buttonPosition,
        title,
        defaultActionType,
        ...(options.getProps?.() ?? {}),
      },
      actions: actions.map(({ type, title: t }) => ({ type, title: t })),
      isOpen() {
        return !!options.show?.value;
      },
      open() {
        setShow(true);
      },
      close() {
        setShow(false);
      },
      toggle() {
        setShow(!options.show?.value);
      },
      setShow,
      getPanelPosition() {
        return { ...panelPosition };
      },
      setPanelPosition(pos: MapControlPanelPosition) {
        Object.assign(panelPosition, pos);
        if (options.panelKind === 'popup' || options.panelKind === 'float') {
          if (options.show?.value) {
            setShow(false);
            void nextTick(() => setShow(true));
          }
        }
      },
      runAction(type?: string, event?: unknown) {
        const list = toValue(options.actions) ?? [];
        syncActionMap(list);
        if (!type) {
          if (list.length === 1) {
            list[0].run(event);
            return;
          }
          if (list.length === 0) {
            setShow(!options.show?.value);
            return;
          }
          const preferred =
            toValue(options.defaultActionType) || options.id;
          const fallback = actionMap.get(preferred);
          if (fallback) {
            fallback(event);
            return;
          }
          throw new Error(
            `[UniversalRegistry] Control '${options.id}' has multiple actions; pass type or set defaultActionType`,
          );
        }
        const run = actionMap.get(type);
        if (!run) {
          throw new Error(
            `[UniversalRegistry] Control '${options.id}' has no action '${type}'`,
          );
        }
        run(event);
      },
    };
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
