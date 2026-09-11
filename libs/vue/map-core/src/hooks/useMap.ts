import type { MapFCOnUseMap, MapSimple } from '@hungpvq/map-core';
import type {
  ButtonInMobile,
  ControlLayout,
  WithMapPropType,
  Position,
  ResolvedControlLayout,
} from '@hungpvq/map-core';
import { resolveControlLayout } from '@hungpvq/map-core';
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
  onMounted(() => {
    getMap(c_mapId.value, async (_map) => {
      mapInstance.value = _map;
      if (onInit instanceof Function) {
        await onInit(_map);
      }
    });
  });
  onUnmounted(async () => {
    if (onDestroy instanceof Function) {
      getMap(c_mapId.value, async (_map) => {
        await onDestroy(_map);
      });
    }
  });
  function callMap(cb: MapFCOnUseMap) {
    return getMap(c_mapId.value, cb);
  }
  const moduleContainerProps = computed(() => ({
    mapId: props.mapId,
    dragId: props.dragId,
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
