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
import { createMapScopedStore, useMapMittStore } from '@hungpvq/vue-map-core';
import type { Feature, FeatureCollection } from 'geojson';
import { onMounted, onUnmounted } from 'vue';
import { logger } from '../logger';

const KEY = 'draw' as const;
export const useMapDrawStore = (mapId: string) =>
  createMapScopedStore<MapDrawStore>(mapId, KEY as any, () => {
    logHelper(logger, mapId, 'store').debug('init');
    return {
      state: {
        featuresAdded: {},
        featuresDeleted: {},
        featuresUpdated: {},
      },
    };
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
  function setFeature(type: 'added' | 'updated' | 'deleted', feature: Feature) {
    DrawService.setFeature(store, type, feature, mapId);
  }
  function save(collection: FeatureCollection, context?: any) {
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
    if (!isDraftOption(action)) {
      return;
    }
    await action.commit();
    config?.onCommit();
  }
  async function discard(item?: IDraftRecord) {
    const action = store.config;
    if (!isDraftOption(action)) {
      return;
    }
    await action.discard(item);
    config?.onDiscard();
  }
  function end() {
    config?.onEnd();
  }
  return { setFeature, save, commit, discard, end };
}

export function isDraftOption(
  opt?: Partial<MapDrawOption>,
): opt is MapDrawDraftOption {
  return !!opt && 'draft' in opt;
}
export const useMapDraw = (mapId: string) => {
  const start = (config: MapDrawOption) => {
    // Resolve by mapId each call — avoid stale store/mitt after map remount.
    const store = useMapDrawStore(mapId);
    const emit = useMapMittStore<MapDrawEvent>(mapId);
    store.config = config;
    logHelper(logger, mapId, 'useMapDraw').debug('start', { config });
    emit.emit(MAP_DRAW_EVENT.START, config);
  };
  return {
    start,
  };
};
