import { errorHandler, logHelper } from '@hungpvq/map-core';
import { getUUIDv4 } from '@hungpvq/shared';
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
    logHelper(logger, mapId, 'DrawService')
      .with({ fn: 'setFeature', span: 'draw.set' })
      .debug('Recording draw feature change in store state.', {
        changeType: type,
        featureId: feature.id,
      });
    const featureId = feature.id ?? getUUIDv4();
    feature.id = featureId;
    switch (type) {
      case 'added':
        store.state.featuresAdded[featureId] = true;
        delete store.state.featuresUpdated[featureId];
        delete store.state.featuresDeleted[featureId];
        break;
      case 'updated':
        // Edit flow loads an existing feature via draw.create — prefer update.
        delete store.state.featuresAdded[featureId];
        store.state.featuresUpdated[featureId] = true;
        break;
      case 'deleted':
        if (store.state.featuresAdded[featureId]) {
          delete store.state.featuresAdded[featureId];
          logHelper(logger, mapId, 'DrawService')
            .with({ fn: 'setFeature', span: 'draw.set' })
            .debug(
              'Deleted draw feature dropped from added set because it was never saved.',
              { featureId },
            );
          return;
        }
        delete store.state.featuresUpdated[featureId];
        store.state.featuresDeleted[featureId] = feature;
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
      if (feature.id == null) return;
      const id_feature = feature.id;
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
      logHelper(logger, mapId, 'DrawService')
        .with({ fn: 'saveDraw', span: 'draw.save' })
        .debug('Draw save started; converting feature collection.', {
          featureCount: collection.features.length,
          hasCallback: !!callback,
        });
      const action = store.config;

      if (callback && !(callback instanceof Function)) {
        throw new Error('Callback is not available');
      }
      if (!action) {
        logHelper(logger, mapId, 'DrawService')
          .with({ fn: 'saveDraw', span: 'draw.save' })
          .debug(
            'Draw save skipped because draw config actions are not configured.',
          );
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

      logHelper(logger, mapId, 'DrawService')
        .with({ fn: 'saveDraw', span: 'draw.save' })
        .debug('Draw save persistence finished.', {
          addedCount: Object.keys(result.added).length,
          updatedCount: Object.keys(result.updated).length,
          deletedCount: Object.keys(result.deleted).length,
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
