import {
  type AnyIEvent,
  logHelper,
  MittTypeMapEvent,
  MittTypeMapEventEventKey,
} from '@hungpvq/map-core';
import { onMounted, onUnmounted, shallowRef } from 'vue';
import { useMapMittStore } from '../../mitt';
import { logger } from '../logger';
import { useMapEventStore } from '../store';

export const useEventMapItems = (
  mapId: string,
  {
    onChange,
  }: {
    onChange?: (p_item: AnyIEvent[]) => void;
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
  function updateItems(p_items: AnyIEvent[]) {
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
