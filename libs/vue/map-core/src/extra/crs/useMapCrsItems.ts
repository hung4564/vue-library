import { logHelper } from '@hungpvq/map-core';
import {
  type CrsItem,
  MittTypeMapCrsEventKey,
  normalizeDisplayEpsgs,
  type MittTypeMapCrs,
  logger,
} from '@hungpvq/map-core/crs';
import { computed, onMounted, onUnmounted, shallowRef } from 'vue';
import { useMapMittStore } from '../../store/mitt-store';
import { useMapCrsStore } from './store';

export const useMapCrsItems = (
  mapId: string,
  {
    onChange,
  }: {
    onChange?: (p_item: CrsItem[]) => void;
  } = {},
) => {
  const emitter = useMapMittStore<MittTypeMapCrs>(mapId);
  const store = useMapCrsStore(mapId);
  const items = shallowRef(store.items);
  function setItems(p_items: CrsItem[]) {
    logHelper(logger, mapId, 'store')
      .with({ fn: 'setItems', span: 'store.update' })
      .debug('setCrsItems', items);
    store.items = p_items;
    emitter.emit(MittTypeMapCrsEventKey.setItems, p_items);
    items.value = [...p_items];
  }
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
  const emitter = useMapMittStore<MittTypeMapCrs>(mapId);
  const store = useMapCrsStore(mapId);
  const item = shallowRef<CrsItem | undefined | null>(store.item);
  function setItem(crs: string | undefined | null) {
    logHelper(logger, mapId, 'store')
      .with({ fn: 'setItem', span: 'store.update' })
      .debug('setCrs', crs);
    store.crs = crs || '4326';
    const crsItem = store.items.find((x) => x.epsg == crs);
    store.item = crsItem;
    emitter.emit(MittTypeMapCrsEventKey.setCurrent, crsItem);
  }
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

export const useMapCrsDisplayEpsgs = (
  mapId: string,
  {
    onChange,
  }: {
    onChange?: (epsgs: string[]) => void;
  } = {},
) => {
  const emitter = useMapMittStore<MittTypeMapCrs>(mapId);
  const store = useMapCrsStore(mapId);
  const displayEpsgs = shallowRef(store.displayEpsgs ?? ['4326']);

  function setDisplayEpsgs(epsgs: string[]) {
    const normalized = normalizeDisplayEpsgs(epsgs);
    logHelper(logger, mapId, 'store')
      .with({ fn: 'setDisplayEpsgs', span: 'store.update' })
      .debug('setDisplayEpsgs', normalized);
    store.displayEpsgs = normalized;
    emitter.emit(MittTypeMapCrsEventKey.setDisplayEpsgs, normalized);
    displayEpsgs.value = [...normalized];
  }

  function updateDisplayEpsgs(epsgs: string[]) {
    displayEpsgs.value = epsgs;
    onChange?.(epsgs);
  }

  onMounted(() => {
    emitter.on(MittTypeMapCrsEventKey.setDisplayEpsgs, updateDisplayEpsgs);
  });
  onUnmounted(() => {
    emitter.off(MittTypeMapCrsEventKey.setDisplayEpsgs, updateDisplayEpsgs);
  });

  return { displayEpsgs, setDisplayEpsgs };
};
