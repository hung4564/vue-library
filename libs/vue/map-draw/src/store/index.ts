import { logHelper } from '@hungpvq/map-core';
import {
  ensureMapDrawStore,
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
import { useMapMittStore } from '@hungpvq/vue-map-core';
import type { Feature, FeatureCollection } from 'geojson';
import { onMounted, onUnmounted } from 'vue';

export function useMapDrawStore(mapId: string): MapDrawStore {
  return ensureMapDrawStore(mapId);
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
    const onEnd = () => config.onEnd();
    emit.on(MAP_DRAW_EVENT.START, config.onStart);
    emit.on(MAP_DRAW_EVENT.END, onEnd);
    if (store.config) {
      logHelper(logger, mapId, 'useConfigDrawControl')
        .with({ fn: 'useConfigDrawControl', span: 'control.init' })
        .debug('start on mounted');
      config.onStart(store.config);
    }
    onUnmounted(async () => {
      emit.off(MAP_DRAW_EVENT.START, config.onStart);
      emit.off(MAP_DRAW_EVENT.END, onEnd);
    });
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
