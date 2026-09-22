import type { MapFCOnUseMap, MapSimple } from '@hungpvq/map-core';
import type {
  ButtonInMobile,
  ControlLayout,
  WithMapPropType,
  Position,
  ResolvedControlLayout,
} from '@hungpvq/map-core';
import { resolveControlLayout, subscribeMapReady } from '@hungpvq/map-core';
import {
  computed,
  inject,
  onMounted,
  onUnmounted,
  ref,
  shallowRef,
  toValue,
  unref,
  type ComputedRef,
  type MaybeRefOrGetter,
} from 'vue';
import { getMap } from '../store/store';

export function useResolvedControlLayout(
  controlLayout?: MaybeRefOrGetter<ControlLayout | undefined>,
): ComputedRef<ResolvedControlLayout> {
  const isMobile = inject<ComputedRef<boolean> | boolean | undefined>(
    '$map.isMobile',
    undefined,
  );
  const buttonInMobile = inject<
    ComputedRef<ButtonInMobile | undefined> | ButtonInMobile | undefined
  >('$map.buttonInMobile', undefined);
  return computed(() =>
    resolveControlLayout(toValue(controlLayout), {
      isMobile: !!unref(isMobile),
      buttonInMobile: unref(buttonInMobile) ?? 'button',
    }),
  );
}

export const useMap = (
  props: WithMapPropType = {},
  onInit?: MapFCOnUseMap,
  onDestroy?: MapFCOnUseMap,
) => {
  const i_map_id = inject('$map.id');
  const i_drag_id = inject<string | undefined>('$map.dragId', undefined);
  const c_mapId = computed(() => {
    return (props.mapId || i_map_id) as string;
  });
  const mapInstance = shallowRef<MapSimple | MapSimple[] | undefined>();

  const registerOrder = inject<(key: string) => number>(
    '$map.registerModuleOrder',
  );

  const resolvedLayout = useResolvedControlLayout(() => props.controlLayout);

  const autoOrder = ref<number>();
  if (
    (props.controlOrder === undefined || props.controlOrder == 0) &&
    registerOrder
  ) {
    const key =
      resolvedLayout.value === 'toolbar'
        ? 'toolbar'
        : `${props.position}`;
    autoOrder.value = registerOrder(key);
  }

  const c_order = computed(() => {
    if (props.controlOrder && +props.controlOrder > 0) {
      return +props.controlOrder;
    }
    return (autoOrder.value ?? 1) * 10;
  });
  let cancelled = false;
  let unsubscribeReady: (() => void) | undefined;
  onMounted(() => {
    cancelled = false;
    const id = c_mapId.value;
    if (!id) return;
    unsubscribeReady = subscribeMapReady(id, async (_map) => {
      if (cancelled) return;
      mapInstance.value = _map;
      if (onInit instanceof Function) {
        await onInit(_map);
      }
    });
  });
  onUnmounted(async () => {
    cancelled = true;
    unsubscribeReady?.();
    unsubscribeReady = undefined;
    if (onDestroy instanceof Function) {
      const map = getMap(c_mapId.value);
      if (map) {
        await onDestroy(map);
      }
    }
  });
  function callMap(cb: MapFCOnUseMap) {
    const id = c_mapId.value;
    if (!id) return undefined;
    return getMap(id, cb);
  }
  const moduleContainerProps = computed(() => ({
    // Resolved ids — empty defaults from withMapProps must not wipe inject.
    mapId: c_mapId.value,
    dragId: props.dragId || i_drag_id || '',
    btnWidth: props.btnWidth,
    position: props.position,
    controlVisible: props.controlVisible,
    controlLayout: resolvedLayout.value,
    controlId: props.controlId,
    controlOrder: c_order.value,
  }));
  return {
    callMap,
    mapId: c_mapId,
    mapInstance,
    moduleContainerProps,
    order: c_order,
    controlLayout: resolvedLayout,
  };
};

export const withMapProps = {
  mapId: { type: String, default: '' },
  dragId: { type: String, default: '' },
  btnWidth: { type: Number, default: 40 },
  position: {
    type: String,
    default: 'bottom-right',
    validator(value: string) {
      return validPositions.indexOf(value as Position) !== -1;
    },
  },
  controlVisible: {
    type: Boolean,
    default: true,
  },
  controlOrder: {
    type: [Number, String],
    default: 0,
  },
  controlLayout: {
    type: String,
    default: 'standalone',
    validator(value: string) {
      return ['standalone', 'toolbar', 'button'].indexOf(value) !== -1;
    },
  },
};

const validPositions: Position[] = [
  'top-left',
  'top-right',
  'bottom-left',
  'bottom-right',
];

export const defaultMapProps: Partial<WithMapPropType> = {
  mapId: '',
  dragId: '',
  btnWidth: 40,
  position: 'bottom-right',
  controlVisible: true,
};
