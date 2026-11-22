import type {
  ButtonInMobile,
  ControlLayout,
  MapFCOnUseMap,
  MapSimple,
  Position,
  ResolvedControlLayout,
  WithMapPropType,
} from '@hungpvq/map-core';
import {
  resolveControlLayout,
  resolveEffectiveButtonInMobile,
  subscribeMapReady,
} from '@hungpvq/map-core';
import {
  computed,
  type ComputedRef,
  inject,
  type MaybeRefOrGetter,
  onMounted,
  onUnmounted,
  PropType,
  ref,
  shallowRef,
  toValue,
  unref,
} from 'vue';

import { getMap } from '../store/store';

export function useResolvedControlLayout(
  controlLayout?: MaybeRefOrGetter<ControlLayout | undefined>,
  controlButtonInMobile?: MaybeRefOrGetter<ButtonInMobile | undefined>,
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
      buttonInMobile:
        resolveEffectiveButtonInMobile(
          toValue(controlButtonInMobile),
          unref(buttonInMobile),
        ) ?? 'button',
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
      resolvedLayout.value === 'toolbar' ? 'toolbar' : `${props.position}`;
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

/** Scalar defaults only — object props (`popupProps`, `controlLayout`) must use
 * factories in `withDefaults`, so they stay out of this object’s type. */
export const defaultMapProps = {
  mapId: '',
  dragId: '',
  btnWidth: 40,
  position: 'bottom-right' as Position,
  controlVisible: true,
} satisfies Partial<WithMapPropType>;
export const withMapProps = (defaultProps: Partial<WithMapPropType>) => ({
  mapId: {
    type: String,
    default: defaultProps.mapId ?? defaultMapProps?.mapId,
  },

  dragId: {
    type: String,
    default: defaultProps.dragId ?? defaultMapProps?.dragId,
  },

  btnWidth: {
    type: Number,
    default: defaultProps.btnWidth ?? defaultMapProps?.btnWidth,
  },

  position: {
    type: String as PropType<Position>,
    default: defaultProps.position ?? defaultMapProps?.position,
    validator(value: Position) {
      return ['top-left', 'top-right', 'bottom-left', 'bottom-right'].includes(
        value,
      );
    },
  },

  controlVisible: {
    type: Boolean,
    default: defaultProps.controlVisible ?? defaultMapProps?.controlVisible,
  },

  controlOrder: {
    type: [Number, String],
    default: defaultProps.controlOrder,
  },

  controlLayout: {
    type: String as PropType<'standalone' | 'toolbar' | 'button'>,
    default: defaultProps.controlLayout,
    validator(value: string) {
      return ['standalone', 'toolbar', 'button'].includes(value);
    },
  },

  buttonInMobile: {
    type: String as PropType<'button' | 'toolbar' | 'menu' | undefined>,
    default: defaultProps.buttonInMobile,
    validator(value: string | undefined) {
      if (value == null || value === '') return true;

      return ['button', 'toolbar', 'menu'].includes(value);
    },
  },
});
