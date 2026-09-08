import { getUUIDv4 } from '@hungpvq/shared';
import { errorHandler, logHelper } from '@hungpvq/map-core';
import type { Feature, FeatureCollection } from 'geojson';
import { DrawError } from '../errors';
import { logger } from '../logger';
import type { DrawSaveFc, DrawSaveFcParams, MapDrawStore } from '../types';

/**
 * Service for managing map drawing operations and data conversion.
 */
export class DrawService {
  static setFeature(
    store: MapDrawStore,
    type: 'added' | 'updated' | 'deleted',
    feature: Feature,
    mapId: string,
  ) {
    logHelper(logger, mapId, 'DrawService').debug('setFeature', {
      type,
      feature,
    });
    if (!feature.id) {
      feature.id = getUUIDv4();
    }
    switch (type) {
      case 'added':
        store.state.featuresAdded[feature.id!] = true;
        delete store.state.featuresUpdated[feature.id!];
        delete store.state.featuresDeleted[feature.id!];
        break;
      case 'updated':
        // Edit flow loads an existing feature via draw.create — prefer update.
        delete store.state.featuresAdded[feature.id!];
        store.state.featuresUpdated[feature.id!] = true;
        break;
      case 'deleted':
        if (store.state.featuresAdded[feature.id!]) {
          delete store.state.featuresAdded[feature.id!];
          return;
        }
        delete store.state.featuresUpdated[feature.id!];
        store.state.featuresDeleted[feature.id!] = feature;
        break;

      default:
        break;
    }
  }

  static convertData(
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
        feature.properties['id'] = feature.id;
      } else if (drawControlUpdatedFeatures[id_feature]) {
        result.updated[id_feature] = feature;
      }
    });
    result.geojson = collection;
    return result;
  }

  static async saveDraw(
    store: MapDrawStore,
    collection: FeatureCollection,
    mapId: string,
    callback?: DrawSaveFc,
    context?: { mapId: string } & Record<string, unknown>,
  ) {
    try {
      logHelper(logger, mapId, 'DrawService').debug('save', {
        collection,
        callback,
      });
      const action = store.config;

      if (callback && !(callback instanceof Function)) {
        throw new Error('Callback is not available');
      }
      if (!action) {
        logHelper(logger, mapId, 'DrawService').debug('save', 'no callback');
        return;
      }
      const result: DrawSaveFcParams = DrawService.convertData(
        store,
        collection,
      );

      const promises: Promise<Feature | void>[] = [];
      const deleteFeature = action.deleteFeature;
      const addFeature = action.addFeature;
      const updateFeature = action.updateFeature;
      const ctx = context || { mapId };
      if (deleteFeature && Object.values(result.deleted).length > 0) {
        Object.values(result.deleted).forEach((feature) => {
          promises.push(deleteFeature(feature, ctx));
        });
      }
      if (addFeature && Object.values(result.added).length > 0) {
        Object.values(result.added).forEach((feature) => {
          promises.push(addFeature(feature, ctx));
        });
      }
      if (updateFeature && Object.values(result.updated).length > 0) {
        Object.values(result.updated).forEach((feature) => {
          promises.push(updateFeature(feature, ctx));
        });
      }
      await Promise.all(promises);

      logHelper(logger, mapId, 'DrawService').debug('save', {
        result,
      });
      callback && callback(result);
      DrawService.clearDraw(store);
    } catch (error) {
      const drawError = new DrawError(`Failed to save draw features`, {
        context: { mapId },
        cause: error,
        recoverable: true,
      });
      errorHandler.handle(drawError);
      throw drawError;
    }
  }

  static clearDraw(store: MapDrawStore) {
    const state = store.state;
    state.featuresAdded = {};
    state.featuresUpdated = {};
    state.featuresDeleted = {};
  }
}
