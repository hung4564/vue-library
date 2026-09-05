/**
 * Placeholder for useMapCrsItems and useMapCrsCurrent hooks
 * Full implementation would be in extra/crs (not migrated yet)
 */

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useMapMittStore } from '../../store/mitt-store';
import { useMapCrsStore } from './store';
import {
  type CrsItem,
  MittTypeMapCrsEventKey,
  normalizeEpsgCode,
  type MittTypeMapCrs,
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
  const [displayEpsgs, setDisplayEpsgsState] = useState<string[]>(
    store.displayEpsgs ?? ['4326'],
  );
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  function setDisplayEpsgs(epsgs: string[]) {
    const normalized = Array.from(
      new Set(
        epsgs
          .map((epsg) => normalizeEpsgCode(epsg))
          .filter((epsg): epsg is string => !!epsg),
      ),
    );
    if (!normalized.includes('4326')) {
      normalized.unshift('4326');
    }
    store.displayEpsgs = normalized;
    emitter.emit(MittTypeMapCrsEventKey.setDisplayEpsgs, normalized);
    setDisplayEpsgsState([...normalized]);
  }

  const updateDisplayEpsgs = useCallback((epsgs: string[]) => {
    setDisplayEpsgsState(epsgs);
    onChangeRef.current?.(epsgs);
  }, []);

  useEffect(() => {
    emitter.on(MittTypeMapCrsEventKey.setDisplayEpsgs, updateDisplayEpsgs);
    return () => {
      emitter.off(MittTypeMapCrsEventKey.setDisplayEpsgs, updateDisplayEpsgs);
    };
  }, [emitter, updateDisplayEpsgs]);

  return { displayEpsgs, setDisplayEpsgs };
};
