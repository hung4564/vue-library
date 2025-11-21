import { getUUIDv4 } from '@hungpvq/shared';
import { logHelper } from '@hungpvq/shared-map';
import { defineStore } from '@hungpvq/shared-store';
import { useMapMittStore } from '@hungpvq/vue-map-core';
import type { Feature, FeatureCollection } from 'geojson';
import { onMounted, onUnmounted } from 'vue';
import { logger } from '../logger';
import {
  DrawSaveFc,
  DrawSaveFcParams,
  IDraftRecord,
  MAP_DRAW_EVENT,
  MapDrawDraftOption,
  MapDrawEvent,
  MapDrawOption,
  MapDrawStore,
} from '../types';

const KEY = 'draw';
export const useMapDrawStore = (mapId: string) =>
  defineStore<MapDrawStore>(['map:core', mapId, KEY], () => {
    logHelper(logger, mapId, 'store').debug('init');
    return {
      state: {
        featuresAdded: {},
        featuresDeleted: {},
        featuresUpdated: {},
      },
      action: {},
    };
  })();
export function useConfigDrawControl(
  mapId: string,
  config: {
    onStart: (config: MapDrawOption) => void;
    onEnd: () => void;
    onDiscard: () => void;
    onCommit: () => void;
  },
) {
  const store = useMapDrawStore(mapId);
  const emit = useMapMittStore<MapDrawEvent>(mapId);
  onMounted(() => {
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
    emit.off(MAP_DRAW_EVENT.START, config.onStart);
    emit.off(MAP_DRAW_EVENT.END, config.onEnd);
  });
  function setFeature(type: 'added' | 'updated' | 'deleted', feature: Feature) {
    logHelper(logger, mapId, 'useConfigDrawControl').debug('setFeature', {
      type,
      feature,
    });
    if (!feature.id) {
      feature.id = getUUIDv4();
    }
    switch (type) {
      case 'added':
        store.state.featuresAdded[feature.id!] = true;
        break;
      case 'updated':
        if (store.state.featuresAdded[feature.id!]) return;
        store.state.featuresUpdated[feature.id!] = true;
        break;
      case 'deleted':
        if (store.state.featuresAdded[feature.id!]) return;
        store.state.featuresDeleted[feature.id!] = feature;
        break;

      default:
        break;
    }
  }
  function save(collection: FeatureCollection, context?: any) {
    return saveDraw(collection, store.config?.callback, context);
  }
  function convertData(
    store: MapDrawStore,
    collection: FeatureCollection,
  ): DrawSaveFcParams {
    const drawControlDeletedFeatures = store.state.featuresDeleted;
    const drawControlAddedFeatures = store.state.featuresAdded;
    const drawControlUpdatedFeatures = store.state.featuresUpdated;
    const result: DrawSaveFcParams = {
      added: {},
      updated: {},
      deleted: drawControlDeletedFeatures,
      geojson: {
        type: 'FeatureCollection',
        features: [],
      },
    };
    collection.features.forEach((feature) => {
      const id_feature = feature.id!;
      if (drawControlAddedFeatures[id_feature]) {
        result.added[id_feature] = feature;
        if (!feature.properties) {
          feature.properties = {};
        }
        feature.properties.id = feature.id;
      } else if (drawControlUpdatedFeatures[id_feature]) {
        result.updated[id_feature] = feature;
      }
    });
    result.geojson = collection;
    return result;
  }
  const saveDraw = async (
    collection: FeatureCollection,
    callback?: DrawSaveFc,
    context?: any,
  ) => {
    logHelper(logger, mapId, 'useConfigDrawControl').debug('save', {
      collection,
      callback,
    });
    const action = store.config;

    if (callback && !(callback instanceof Function)) {
      throw new Error('Callback is not available');
    }
    if (!action) {
      logHelper(logger, mapId, 'useConfigDrawControl').debug(
        'save',
        'no callback',
      );
      return;
    }
    const result: DrawSaveFcParams = convertData(store, collection);

    const promises: Promise<Feature | void>[] = [];
    const deleteFeature = action.deleteFeature;
    const addFeature = action.addFeature;
    const updateFeature = action.updateFeature;
    if (deleteFeature && Object.values(result.deleted).length > 0) {
      Object.values(result.deleted).forEach((feature) => {
        promises.push(deleteFeature(feature, context));
      });
    }
    if (addFeature && Object.values(result.added).length > 0) {
      Object.values(result.added).forEach((feature) => {
        promises.push(addFeature(feature, context));
      });
    }
    if (updateFeature && Object.values(result.updated).length > 0) {
      Object.values(result.updated).forEach((feature) => {
        promises.push(updateFeature(feature, context));
      });
    }
    await Promise.all(promises);

    logHelper(logger, mapId, 'useConfigDrawControl').debug('save', {
      result,
    });
    callback && callback(result);
    clearDraw();
  };
  const clearDraw = () => {
    const state = store.state;
    state.featuresAdded = {};
    state.featuresAdded = {};
    state.featuresDeleted = {};
  };
  async function commit() {
    const action = store.config;
    if (!isDraftOption(action)) {
      return;
    }
    await action.commit();
    config.onCommit();
  }
  async function discard(item?: IDraftRecord) {
    const action = store.config;
    if (!isDraftOption(action)) {
      return;
    }
    await action.discard(item);
    config.onDiscard();
  }
  function end() {
    config.onEnd();
  }
  return { setFeature, save, commit, discard, end };
}

export function isDraftOption(
  opt?: Partial<MapDrawOption>,
): opt is MapDrawDraftOption {
  return !!opt && 'draft' in opt;
}
export const useMapDraw = (mapId: string) => {
  const emit = useMapMittStore<MapDrawEvent>(mapId);
  const store = useMapDrawStore(mapId);
  const start = (config: MapDrawOption) => {
    store.config = config;
    logHelper(logger, mapId, 'useMapDraw').debug('start', { config });
    emit.emit(MAP_DRAW_EVENT.START, config);
  };
  return {
    start,
  };
};
