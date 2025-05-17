import { onMounted, onUnmounted, shallowRef } from 'vue';
import { getStore } from '../../../store';
import { MittType } from '../../../types';
import { MAP_STORE_KEY } from '../../../types/key';
import { getEvents } from '../store';
import { IEvent, MittTypeMapEvent, MittTypeMapEventEventKey } from '../types';

export const useEventMapItems = (
  mapId: string,
  {
    onChange,
  }: {
    onChange?: (p_item: IEvent[]) => void;
  } = {},
) => {
  const items = shallowRef(getEvents(mapId));
  const emitter = getStore<MittType<MittTypeMapEvent>>(
    mapId,
    MAP_STORE_KEY.MITT,
  );
  function updateItems(p_items: IEvent[]) {
    items.value = p_items;
    onChange && onChange(p_items);
  }
  onMounted(() => {
    emitter.on(MittTypeMapEventEventKey.setItems, updateItems);
  });
  onUnmounted(() => {
    emitter.off(MittTypeMapEventEventKey.setItems, updateItems);
  });
  return { items };
};
