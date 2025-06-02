import { onMounted, onUnmounted, shallowRef } from 'vue';
import { useMapMittStore } from '../../mitt';
import { useMapEventStore } from '../store';
import { IEvent, MittTypeMapEvent, MittTypeMapEventEventKey } from '../types';

export const useEventMapItems = (
  mapId: string,
  {
    onChange,
  }: {
    onChange?: (p_item: IEvent[]) => void;
  } = {},
) => {
  const store = useMapEventStore(mapId);
  function getEvents() {
    return store.items;
  }

  const items = shallowRef(getEvents());
  const emitter = useMapMittStore<MittTypeMapEvent>(mapId);
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
