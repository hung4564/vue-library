import { logHelper } from '@hungpvq/map-core';
import {
  type AnyIEvent,
  MittTypeMapEvent,
  MittTypeMapEventEventKey,
} from '@hungpvq/map-core/event';
import { onMounted, onUnmounted, shallowRef } from 'vue';
import { useMapMittStore } from '../../../store/mitt-store';
import { logger } from '@hungpvq/map-core/event';
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
    logHelper(logger, mapId, 'hook', 'useEventMapItems')
      .with({ fn: 'updateItems', span: 'store.update' })
      .debug('updateItems', p_items);
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
