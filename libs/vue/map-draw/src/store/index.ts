import { logHelper } from '@hungpvq/map-core';
import {
  createDefaultMapDrawStore,
  logger,
  MAP_DRAW_EVENT,
  runDrawCommit,
  runDrawDiscard,
  runDrawSave,
  runDrawSetFeature,
  runDrawStart,
  type IDraftRecord,
  type MapDrawEvent,
  type MapDrawOption,
  type MapDrawStore,
} from '@hungpvq/map-draw';
import {
  createMapScopedStore,
  getStore,
  useMapMittStore,
} from '@hungpvq/vue-map-core';
import type { Feature, FeatureCollection } from 'geojson';
import { onMounted, onUnmounted } from 'vue';

const KEY = 'draw' as const;

function endDrawSession(mapId: string, store: MapDrawStore) {
  if (!store.config) return;
  store.config = undefined;
  store.state.featuresAdded = {};
  store.state.featuresUpdated = {};
  store.state.featuresDeleted = {};
  logHelper(logger, mapId, 'store').debug('end on removeMap');
  useMapMittStore<MapDrawEvent>(mapId).emit(MAP_DRAW_EVENT.END);
}

export function useMapDrawStore(mapId: string): MapDrawStore {
  return createMapScopedStore<MapDrawStore>(
    mapId,
    KEY as any,
    () => {
      logHelper(logger, mapId, 'store').debug('init');
      return createDefaultMapDrawStore();
    },
    {
      cleanup: (): void => {
        const store = getStore<MapDrawStore>(mapId, KEY);
        if (!store) return;
        endDrawSession(mapId, store);
      },
    },
  );
}

export function useConfigDrawControl(
  mapId: string,
  config?: {
    onStart: (config: MapDrawOption) => void;
    onEnd: () => void;
    onDiscard: () => void;
    onCommit: () => void;
  },
) {
  const store = useMapDrawStore(mapId);
  const emit = useMapMittStore<MapDrawEvent>(mapId);
  onMounted(() => {
    if (!config) return;
    emit.on(MAP_DRAW_EVENT.START, config.onStart);
    emit.on(MAP_DRAW_EVENT.END, config.onEnd);
    if (store.config) {
      logHelper(logger, mapId, 'useConfigDrawControl').debug(
        'start on mounted',
      );
      config.onStart(store.config);
    }
  });
  onUnmounted(async () => {
    if (!config) return;
    emit.off(MAP_DRAW_EVENT.START, config.onStart);
    emit.off(MAP_DRAW_EVENT.END, config.onEnd);
  });

  return {
    setFeature: (type: 'added' | 'updated' | 'deleted', feature: Feature) =>
      runDrawSetFeature(store, type, feature, mapId),
    save: (
      collection: FeatureCollection,
      context?: { mapId: string } & Record<string, unknown>,
    ) => runDrawSave(store, collection, mapId, context),
    commit: () => runDrawCommit(store, config?.onCommit),
    discard: (item?: IDraftRecord) =>
      runDrawDiscard(store, item, config?.onDiscard),
    end: () => config?.onEnd(),
  };
}

export const useMapDraw = (mapId: string) => ({
  start: (config: MapDrawOption) => {
    runDrawStart(
      useMapDrawStore(mapId),
      useMapMittStore<MapDrawEvent>(mapId),
      config,
      mapId,
    );
  },
});
