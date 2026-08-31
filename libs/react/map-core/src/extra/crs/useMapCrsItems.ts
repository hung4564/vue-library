/**
 * Placeholder for useMapCrsItems and useMapCrsCurrent hooks
 * Full implementation would be in extra/crs (not migrated yet)
 */

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
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
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  function setItems(p_items: CrsItem[]) {
    store.items = p_items;
    emitter.emit(MittTypeMapCrsEventKey.setItems, p_items);
    setItemsState([...p_items]);
  }

  const updateItems = useCallback((p_items: CrsItem[]) => {
    setItemsState(p_items);
    onChangeRef.current?.(p_items);
  }, []);

  useEffect(() => {
    emitter.on(MittTypeMapCrsEventKey.setItems, updateItems);
    return () => {
      emitter.off(MittTypeMapCrsEventKey.setItems, updateItems);
    };
  }, [emitter, updateItems]);

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
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  function setItem(crs: string | undefined | null) {
    store.crs = crs || '4326';
    const crsItem = store.items.find((x: CrsItem) => x.epsg === crs);
    store.item = crsItem;
    emitter.emit(MittTypeMapCrsEventKey.setCurrent, crsItem);
  }

  const updateItem = useCallback((p_item: CrsItem | undefined | null) => {
    setItemState(p_item);
    onChangeRef.current?.(p_item);
  }, []);

  useEffect(() => {
    emitter.on(MittTypeMapCrsEventKey.setCurrent, updateItem);
    return () => {
      emitter.off(MittTypeMapCrsEventKey.setCurrent, updateItem);
    };
  }, [emitter, updateItem]);

  const isCrsDegree = useMemo(() => {
    return item?.unit === 'degree';
  }, [item]);

  return { item, setItem, isCrsDegree };
};
