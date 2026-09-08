import { logHelper } from '@hungpvq/map-core';
import {
  DrawService,
  MAP_DRAW_EVENT,
  type IDraftRecord,
  type MapDrawDraftOption,
  type MapDrawEvent,
  type MapDrawOption,
  type MapDrawStore,
} from '@hungpvq/map-draw';
import { createMapScopedStore, getMapMittStore } from '@hungpvq/react-map-core';
import type { Feature, FeatureCollection } from 'geojson';
import { useEffect, useRef } from 'react';
import { logger } from '../logger';

const KEY = 'draw' as const;

export function useMapDrawStore(mapId: string) {
  return createMapScopedStore<MapDrawStore>(
    mapId,
    KEY as string & object,
    () => {
      logHelper(logger, mapId, 'store').debug('init');
      return {
        state: {
          featuresAdded: {},
          featuresDeleted: {},
          featuresUpdated: {},
        },
      };
    },
  );
}

/** Non-hook alias for resolving the store outside React render (e.g. start()). */
export const getMapDrawStore = useMapDrawStore;

export function isDraftOption(
  opt?: Partial<MapDrawOption>,
): opt is MapDrawDraftOption {
  return !!opt && 'draft' in opt;
}

export function useMapDraw(mapId: string) {
  return {
    /**
     * Resolve store/mitt by mapId on each call so React Strict Mode
     * (removeMap then remount) cannot leave start() pointing at orphaned refs.
     */
    start(config: MapDrawOption) {
      const store = getMapDrawStore(mapId);
      const emit = getMapMittStore<MapDrawEvent>(mapId);
      store.config = config;
      logHelper(logger, mapId, 'useMapDraw').debug('start', { config });
      emit.emit(MAP_DRAW_EVENT.START, config);
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

  function setFeature(type: 'added' | 'updated' | 'deleted', feature: Feature) {
    DrawService.setFeature(store, type, feature, mapId);
  }

  function save(collection: FeatureCollection, context?: { mapId: string }) {
    return DrawService.saveDraw(
      store,
      collection,
      mapId,
      store.config?.callback,
      context,
    );
  }

  async function commit() {
    const action = store.config;
    if (!isDraftOption(action)) return;
    await action.commit();
    configRef.current?.onCommit?.();
  }

  async function discard(item?: IDraftRecord) {
    const action = store.config;
    if (!isDraftOption(action)) return;
    await action.discard(item);
    configRef.current?.onDiscard?.();
  }

  return { setFeature, save, commit, discard };
}
