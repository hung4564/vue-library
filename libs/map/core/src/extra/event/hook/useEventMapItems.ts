import { logHelper } from '@hungpvq/shared-map';
import { onMounted, onUnmounted, shallowRef } from 'vue';
import { useMapMittStore } from '../../mitt';
import { logger } from '../logger';
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
  function getCurrent() {
    return store.current;
  }

  const items = shallowRef(getEvents());
  const emitter = useMapMittStore<MittTypeMapEvent>(mapId);
  function updateItems(p_items: IEvent[]) {
    items.value = p_items;
    logHelper(logger, mapId, 'hook', 'useEventMapItems').debug(
      'updateItems',
      p_items,
    );
    onChange && onChange(p_items);
  }
  onMounted(() => {
    emitter.on(MittTypeMapEventEventKey.setItems, updateItems);
    onChange && onChange(getEvents());
  });
  onUnmounted(() => {
    emitter.off(MittTypeMapEventEventKey.setItems, updateItems);
  });
  return { items, getCurrent };
};
