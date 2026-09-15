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
import { createMapScopedStore, useMapMittStore } from '@hungpvq/vue-map-core';
import type { Feature, FeatureCollection } from 'geojson';
import { onMounted, onUnmounted } from 'vue';

const KEY = 'draw' as const;

export const useMapDrawStore = (mapId: string) =>
  createMapScopedStore<MapDrawStore>(mapId, KEY as any, () => {
    logHelper(logger, mapId, 'store').debug('init');
    return createDefaultMapDrawStore();
  });

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
    save: (collection: FeatureCollection, context?: unknown) =>
      runDrawSave(store, collection, mapId, context),
    commit: () => runDrawCommit(store, config?.onCommit),
    discard: (item?: IDraftRecord) => runDrawDiscard(store, item, config?.onDiscard),
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
