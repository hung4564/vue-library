import { MapFCOnUseMap, MapSimple } from '@hungpvq/shared-map';
import { computed, inject, onMounted, onUnmounted, shallowRef } from 'vue';
import { getMap } from '../store/store';

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
  const moduleContainerProps = {
    mapId: props.mapId,
    dragId: props.dragId,
    btnWidth: props.btnWidth,
    position: props.position,
    controlVisible: props.controlVisible,
    controlLayout: props.controlLayout,
    order: props.order,
    top: props.top,
    bottom: props.bottom,
    left: props.left,
    right: props.right,
  };
  return {
    callMap,
    mapId: c_mapId,
    mapInstance,
    moduleContainerProps,
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
      return (
        ['top-left', 'top-right', 'bottom-left', 'bottom-right'].indexOf(
          value,
        ) !== -1
      );
    },
  },
  controlVisible: {
    type: Boolean,
    default: true,
  },
  order: {
    type: Number,
    default: 0,
  },
  top: Number,
  bottom: Number,
  left: Number,
  right: Number,
};
const validPositions = [
  'top-left',
  'top-right',
  'bottom-left',
  'bottom-right',
] as const;
type Position = (typeof validPositions)[number];

export interface WithMapPropType {
  mapId?: string;
  dragId?: string;
  btnWidth?: number;
  position?: Position;
  controlVisible?: boolean;
  controlLayout?: 'standalone' | 'toolbar';
  order?: number;
  top?: number;
  bottom?: number;
  left?: number;
  right?: number;
}

export const defaultMapProps: Partial<WithMapPropType> = {
  mapId: '',
  dragId: '',
  btnWidth: 40,
  position: 'bottom-right',
  controlVisible: true,
};
