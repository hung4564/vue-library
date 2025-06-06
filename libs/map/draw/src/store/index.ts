import { getUUIDv4 } from '@hungpvq/shared';
import { logHelper } from '@hungpvq/shared-map';
import { defineStore } from '@hungpvq/shared-store';
import type { Feature, FeatureCollection, GeoJSON } from 'geojson';
import { reactive } from 'vue';
import { logger } from '../logger';
import {
  DrawOption,
  DrawSaveFc,
  DrawSaveFcParams,
  MapDrawStore,
} from '../types';
export const KEY = 'draw';

export const useMapDrawStore = (mapId: string) =>
  defineStore<MapDrawStore>(['map:core', mapId, KEY], () => {
    logHelper(logger, mapId, 'store').debug('init');
    return {
      control: null,
      state: reactive({
        activated: false,
        register_id: undefined,
        show: false,
        draw_support: [],
        cleanAfterDone: false,
      }),
      featuresAdded: {},
      featuresUpdated: {},
      featuresDeleted: {},
      action: {},
    };
  })();
export const useMapDraw = (mapId: string) => {
  const store = useMapDrawStore(mapId);
  const initDrawControl = (control: any) => {
    logHelper(logger, mapId, 'store').debug('initDrawControl', control);
    store.control = control;
  };
  const activateDraw = (register_id: string, geojson?: GeoJSON) => {
    if (!register_id) {
      throw new Error('Need register id');
    }
    logHelper(logger, mapId, 'store').debug(
      'activateDraw',
      register_id,
      geojson,
    );
    const state = store.state;
    const control = store.control;
    state.register_id = register_id;
    state.activated = true;
    control.changeMode('simple_select');
    if (geojson) {
      control.add(geojson);
    }
  };
  const deactivateDraw = () => {
    logHelper(logger, mapId, 'store').debug('deactivateDraw');
    const control = store.control;
    const result: DrawSaveFcParams = convertData(store);
    store.action.save && store.action.save(result.geojson);
    store.action.close && store.action.close();
    store.state.draw_support = [];
    const state = store.state;
    state.show = false;
    store.action = {};
    state.register_id = undefined;
    state.activated = false;
    store.callback = undefined;
    store.featuresAdded = {};
    store.featuresUpdated = {};
    store.featuresDeleted = {};
    control?.deleteAll();
  };
  function checkDrawId(register_id: string) {
    const state = store.state;
    if (!state.activated) {
      throw new Error('Need to call activateDraw first');
    }
    if (state.register_id && state.register_id !== register_id) {
      throw new Error('register id not match');
    }
  }
  const draw = (
    register_id: string,
    type: string,
    callback?: DrawSaveFc,
    options?: any,
  ) => {
    logHelper(logger, mapId, 'store').debug('draw', {
      register_id,
      type,
      callback,
      options,
    });
    checkDrawId(register_id);
    const control = store.control;
    store.callback = callback;
    control.changeMode(type, options);
  };
  function convertData(store: MapDrawStore): DrawSaveFcParams {
    const control = store.control;
    const drawControlDeletedFeatures = store.featuresDeleted;
    const drawControlAddedFeatures = store.featuresAdded;
    const drawControlUpdatedFeatures = store.featuresUpdated;
    const result: DrawSaveFcParams = {
      added: {},
      updated: {},
      deleted: drawControlDeletedFeatures,
      geojson: {
        type: 'FeatureCollection',
        features: [],
      },
    };
    const collection = control.getAll() as FeatureCollection;
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
  const saveDraw = (register_id: string, callback?: DrawSaveFc) => {
    const state = store.state;
    const action = store.action;
    checkDrawId(register_id);

    if (callback && !(callback instanceof Function)) {
      throw new Error('Callback is not available');
    }
    const result: DrawSaveFcParams = convertData(store);

    logHelper(logger, mapId, 'store').debug('saveDraw', {
      register_id,
      result,
    });
    if (action.deleteFeatures) {
      action.deleteFeatures(Object.values(result.deleted));
    }
    if (action.addFeatures) {
      action.addFeatures(Object.values(result.added));
    }
    if (action.updateFeatures) {
      action.updateFeatures(Object.values(result.updated));
    }
    if (action.reset) {
      action.reset();
    }

    callback && callback(result);
    state.activated = false;
    clearDraw();
    // deactivateDraw(mapId);
  };
  function cancelDraw() {
    logHelper(logger, mapId, 'store').debug('cancelDraw');
    const state = store.state;
    clearDraw();
    state.activated = false;
    // deactivateDraw(mapId);
  }
  const clearDraw = () => {
    logHelper(logger, mapId, 'store').debug('clearDraw');
    const state = store.state;
    store.featuresAdded = {};
    store.featuresAdded = {};
    store.featuresDeleted = {};
    if (state.cleanAfterDone) {
      store.control.deleteAll();
    }
    store.control.changeMode('simple_select');
  };
  function setFeature(type: 'added' | 'updated' | 'deleted', feature: Feature) {
    logHelper(logger, mapId, 'store').debug('setFeature', { type, feature });
    switch (type) {
      case 'added':
        store.featuresAdded[feature.id!] = true;
        break;

      case 'updated':
        if (store.featuresAdded[feature.id!]) return;
        store.featuresUpdated[feature.id!] = true;
        break;
      case 'deleted':
        if (store.featuresAdded[feature.id!]) return;
        store.featuresDeleted[feature.id!] = feature;
        break;

      default:
        break;
    }
  }
  function checkAndCallDone(register_id: string) {
    if (store.callback) {
      saveDraw(register_id, store.callback);
      store.callback = undefined;
    }
  }
  function callDraw(option: DrawOption) {
    logHelper(logger, mapId, 'store').debug('callDraw', { option });
    const register_id = getUUIDv4();
    const state = store.state;
    const action = store.action;
    state.register_id = register_id;
    state.show = true;
    state.cleanAfterDone = !!option.cleanAfterDone;
    state.draw_support = option.draw_support;
    action.addFeatures = option.addFeatures;
    action.updateFeatures = option.updateFeatures;
    action.deleteFeatures = option.deleteFeatures;
    action.getFeatures = option.getFeatures;
    action.reset = option.reset;
    action.save = option.save;
    return register_id;
  }

  const getDrawIsActivated = () => store.state.activated;
  const getDrawSupport = () => store.state.draw_support;

  const getDrawIsRegisterId = () => store.state.register_id;

  const getDrawIsShow = () => store.state.show;
  const getDrawAction = () => store.action;
  const getDrawControl = () => store.control;

  return {
    initDrawControl,
    activateDraw,
    deactivateDraw,
    callDraw,
    setFeature,
    checkAndCallDone,
    getDrawSupport,
    cancelDraw,
    draw,
    saveDraw,
    getDrawIsActivated,
    getDrawIsRegisterId,
    getDrawIsShow,
    getDrawAction,
    getDrawControl,
  };
};
