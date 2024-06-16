import { MapFCOnUseMap } from '@hungpvq/shared-map';
import { computed, inject, onMounted, onUnmounted } from 'vue';
import { actions } from '../store/store';

export const useMap = (
  props: any = {},
  onInit?: MapFCOnUseMap,
  onDestroy?: MapFCOnUseMap
) => {
  const i_map_id = inject('$map.id');
  const c_mapId = computed(() => {
    return props.mapId || i_map_id;
  });
  onMounted(() => {
    actions.getMap(c_mapId.value, async (_map) => {
      if (onInit instanceof Function) {
        await onInit(_map);
      }
    });
  });
  onUnmounted(async () => {
    if (onDestroy instanceof Function) {
      actions.getMap(c_mapId.value, async (_map) => {
        if (onInit instanceof Function) {
          await onDestroy(_map);
        }
      });
    }
  });
  function callMap(cb: MapFCOnUseMap) {
    return actions.getMap(c_mapId.value, cb);
  }
  const moduleContainerProps = {
    mapId: props.mapId,
    dragId: props.dragId,
    btnWidth: props.btnWidth,
    position: props.position,
    controlVisible: props.controlVisible,
    order: props.order,
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
          value
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
