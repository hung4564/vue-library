import { onMounted, onUnmounted, ref } from 'vue';
import { useMapMittStore } from '../../mitt';
import { getMapCompareSetting, updateMapCompareSetting } from '../store';
import {
  MapCompareSetting,
  MittTypeMapCompare,
  MittTypeMapCompareEventKey,
} from '../types';

export const useMapCompareSetting = (
  mapId: string,
  { onChange }: { onChange?: (setting: MapCompareSetting) => void } = {},
) => {
  const setting = ref(getMapCompareSetting(mapId) || {});
  function updateSetting() {
    updateMapCompareSetting(mapId, setting.value);
  }
  function update(p_setting: MapCompareSetting) {
    setting.value = p_setting;
    onChange && onChange(p_setting);
  }
  const emitter = useMapMittStore<MittTypeMapCompare>(mapId);
  onMounted(() => {
    emitter.on(MittTypeMapCompareEventKey.set, update);
  });
  onUnmounted(() => {
    emitter.off(MittTypeMapCompareEventKey.set, update);
  });
  return {
    updateSetting,
    setting,
  };
};
