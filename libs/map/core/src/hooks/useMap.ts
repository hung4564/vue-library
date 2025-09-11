import { MapFCOnUseMap } from '@hungpvq/shared-map';
import { computed, inject, onMounted, onUnmounted } from 'vue';
import { getMap } from '../store/store';

export const useMap = (
  props: any = {},
  onInit?: MapFCOnUseMap,
  onDestroy?: MapFCOnUseMap,
) => {
  const i_map_id = inject('$map.id');
  const c_mapId = computed(() => {
    return props.mapId || i_map_id;
  });
  onMounted(() => {
    getMap(c_mapId.value, async (_map) => {
      if (onInit instanceof Function) {
        await onInit(_map);
      }
    });
  });
  onUnmounted(async () => {
    if (onDestroy instanceof Function) {
      getMap(c_mapId.value, async (_map) => {
        if (onInit instanceof Function) {
          await onDestroy(_map);
        }
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
    order: props.order,
    top: props.top,
    bottom: props.bottom,
    left: props.left,
    right: props.right,
  };
  return { callMap, mapId: c_mapId, moduleContainerProps };
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
  order?: number;
}

export const defaultMapProps: Required<WithMapPropType> = {
  mapId: '',
  dragId: '',
  btnWidth: 40,
  position: 'bottom-right',
  controlVisible: true,
  order: 0,
};
