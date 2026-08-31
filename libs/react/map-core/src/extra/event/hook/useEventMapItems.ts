import { useCallback, useEffect, useRef, useState } from 'react';
import {
  type AnyIEvent,
  type MittTypeMapEvent,
  MittTypeMapEventEventKey,
} from '@hungpvq/map-core';
import { useMapMittStore } from '../../mitt';
import { useMapEventStore } from '../store';

export const useEventMapItems = (
  mapId: string,
  { onChange }: { onChange?: (p_item: AnyIEvent[]) => void } = {},
) => {
  const store = useMapEventStore(mapId);
  const [items, setItems] = useState(() => [...store.items]);
  const emitter = useMapMittStore<MittTypeMapEvent>(mapId);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  useEffect(() => {
    const updateItems = (p_items: AnyIEvent[]) => {
      // EventManager mutates store.items in place — copy so React state updates
      const next = [...p_items];
      setItems(next);
      onChangeRef.current?.(next);
    };
    emitter.on(MittTypeMapEventEventKey.setItems, updateItems);
    // Sync immediately (matches Vue onMounted onChange)
    onChangeRef.current?.([...store.items]);
    return () => {
      emitter.off(MittTypeMapEventEventKey.setItems, updateItems);
    };
  }, [emitter, mapId, store]);

  const getCurrent = useCallback(() => store.current, [store]);

  return {
    items,
    getCurrent,
  };
};
