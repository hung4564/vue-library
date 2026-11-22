import {
  ensureMapDrawStore,
  type IDraftRecord,
  MAP_DRAW_EVENT,
  type MapDrawEvent,
  type MapDrawOption,
  type MapDrawStore,
  runDrawCommit,
  runDrawDiscard,
  runDrawSave,
  runDrawSetFeature,
  runDrawStart,
} from '@hungpvq/map-draw';
import { getMapMittStore } from '@hungpvq/react-map-core';
import type { Feature, FeatureCollection } from 'geojson';
import { useEffect, useRef } from 'react';

export function useMapDrawStore(mapId: string): MapDrawStore {
  return ensureMapDrawStore(mapId);
}

/** Non-hook alias for resolving the store outside React render (e.g. start()). */
export const getMapDrawStore = useMapDrawStore;

export function useMapDraw(mapId: string) {
  return {
    start(config: MapDrawOption) {
      runDrawStart(
        getMapDrawStore(mapId),
        getMapMittStore(mapId),
        config,
        mapId,
      );
    },
  };
}

type ConfigHandlers = {
  onStart: (config: MapDrawOption) => void;
  onEnd: () => void;
  onDiscard?: () => void;
  onCommit?: () => void;
};

export function useConfigDrawControl(mapId: string, config?: ConfigHandlers) {
  const store = useMapDrawStore(mapId);
  const emit = getMapMittStore<MapDrawEvent>(mapId);
  const configRef = useRef(config);
  configRef.current = config;

  useEffect(() => {
    const onStart = (c: MapDrawOption) => configRef.current?.onStart(c);
    const onEnd = () => configRef.current?.onEnd();
    emit.on(MAP_DRAW_EVENT.START, onStart);
    emit.on(MAP_DRAW_EVENT.END, onEnd);
    if (store.config) {
      onStart(store.config);
    }
    return () => {
      emit.off(MAP_DRAW_EVENT.START, onStart);
      emit.off(MAP_DRAW_EVENT.END, onEnd);
    };
  }, [mapId, emit, store]);

  return {
    setFeature: (type: 'added' | 'updated' | 'deleted', feature: Feature) =>
      runDrawSetFeature(store, type, feature, mapId),
    save: (collection: FeatureCollection, context?: { mapId: string }) =>
      runDrawSave(store, collection, mapId, context),
    commit: () => runDrawCommit(store, configRef.current?.onCommit),
    discard: (item?: IDraftRecord) =>
      runDrawDiscard(store, item, configRef.current?.onDiscard),
  };
}
