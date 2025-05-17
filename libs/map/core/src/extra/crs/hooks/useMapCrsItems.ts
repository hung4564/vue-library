import { computed, onMounted, onUnmounted, shallowRef } from 'vue';
import { getStore } from '../../../store';
import { MittType } from '../../../types';
import { MAP_STORE_KEY } from '../../../types/key';
import { getCrsItem, getCrsItems, setCrs, setCrsItems } from '../store';
import { CrsItem, MittTypeMapCrs, MittTypeMapCrsEventKey } from '../types';

export const useMapCrsItems = (
  mapId: string,
  {
    onChange,
  }: {
    onChange?: (p_item: CrsItem[]) => void;
  } = {},
) => {
  const items = shallowRef(getCrsItems(mapId));
  function setItems(p_items: CrsItem[]) {
    setCrsItems(mapId, p_items);
    items.value = [...p_items];
  }
  const emitter = getStore<MittType<MittTypeMapCrs>>(mapId, MAP_STORE_KEY.MITT);
  function updateItems(p_items: CrsItem[]) {
    items.value = p_items;
    onChange && onChange(p_items);
  }
  onMounted(() => {
    emitter.on(MittTypeMapCrsEventKey.setItems, updateItems);
  });
  onUnmounted(() => {
    emitter.off(MittTypeMapCrsEventKey.setItems, updateItems);
  });
  return { items, setItems };
};

export const useMapCrsCurrent = (
  mapId: string,
  {
    onChange,
  }: {
    onChange?: (p_item: CrsItem | undefined | null) => void;
  } = {},
) => {
  const item = shallowRef<CrsItem | undefined | null>(getCrsItem(mapId));
  function setItem(crs: string | undefined | null) {
    setCrs(mapId, crs);
  }
  const emitter = getStore<MittType<MittTypeMapCrs>>(mapId, MAP_STORE_KEY.MITT);
  function updateItem(p_item: CrsItem | undefined | null) {
    item.value = p_item;
    onChange && onChange(p_item);
  }
  onMounted(() => {
    emitter.on(MittTypeMapCrsEventKey.setCurrent, updateItem);
  });
  onUnmounted(() => {
    emitter.off(MittTypeMapCrsEventKey.setCurrent, updateItem);
  });
  const isCrsDegree = computed(() => {
    return item.value?.unit === 'degree';
  });
  return { item, setItem, isCrsDegree };
};
