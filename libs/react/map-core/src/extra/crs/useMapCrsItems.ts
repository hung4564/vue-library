/**
 * Placeholder for useMapCrsItems and useMapCrsCurrent hooks
 * Full implementation would be in extra/crs (not migrated yet)
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useMapMittStore } from '../../store/mitt-store';
import { useMapCrsStore } from './store';
import {
  type CrsItem,
  type MittTypeMapCrs,
  MittTypeMapCrsEventKey,
} from '@hungpvq/map-core';

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
  const [items, setItemsState] = useState<CrsItem[]>(store.items);

  function setItems(p_items: CrsItem[]) {
    store.items = p_items;
    emitter.emit(MittTypeMapCrsEventKey.setItems, p_items);
    setItemsState([...p_items]);
  }

  function updateItems(p_items: CrsItem[]) {
    setItemsState(p_items);
    onChange && onChange(p_items);
  }

  useEffect(() => {
    emitter.on(MittTypeMapCrsEventKey.setItems, updateItems);
    return () => {
      emitter.off(MittTypeMapCrsEventKey.setItems, updateItems);
    };
  }, [emitter, onChange]);

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
  const [item, setItemState] = useState<CrsItem | undefined | null>(store.item);

  function setItem(crs: string | undefined | null) {
    store.crs = crs || '4326';
    const crsItem = store.items.find((x) => x.epsg == crs);
    store.item = crsItem;
    emitter.emit(MittTypeMapCrsEventKey.setCurrent, crsItem);
  }

  function updateItem(p_item: CrsItem | undefined | null) {
    setItemState(p_item);
    onChange && onChange(p_item);
  }

  useEffect(() => {
    emitter.on(MittTypeMapCrsEventKey.setCurrent, updateItem);
    return () => {
      emitter.off(MittTypeMapCrsEventKey.setCurrent, updateItem);
    };
  }, [emitter, onChange]);

  const isCrsDegree = useMemo(() => {
    return item?.unit === 'degree';
  }, [item]);

  return { item, setItem, isCrsDegree };
};
