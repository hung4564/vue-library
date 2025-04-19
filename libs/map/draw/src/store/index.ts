import { getUUIDv4 } from '@hungpvq/shared';
import {
  addStore,
  addToQueue,
  getStore,
  store as storeMap,
} from '@hungpvq/vue-map-core';
import type { Feature, FeatureCollection, GeoJSON } from 'geojson';
import { reactive } from 'vue';
import {
  DrawOption,
  DrawSaveFc,
  DrawSaveFcParams,
  ILayerDrawView,
  MapDrawStore,
} from '../types';
export const KEY = 'draw';
export function initMapDraw(mapId: string) {
  addStore<MapDrawStore>(mapId, KEY, {
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
  });
}
addToQueue(KEY, initMapDraw);

function getDrawStore(map_id: string): MapDrawStore {
  return getStore<MapDrawStore>(map_id, KEY);
}
export const initDrawControl = (map_id: string, control: any) => {
  getDrawStore(map_id).control = control;
};

export const activateDraw = (
  map_id: string,
  register_id: string,
  geojson?: GeoJSON
) => {
  if (!register_id) {
    throw new Error('Need register id');
  }
  const store = getDrawStore(map_id);
  const state = store.state;
  const control = store.control;
  state.register_id = register_id;
  state.activated = true;
  control.changeMode('simple_select');
  if (geojson) {
    control.add(geojson);
  }
};
export const deactivateDraw = (map_id: string) => {
  const store = getDrawStore(map_id);
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
function checkDrawId(map_id: string, register_id: string) {
  const store = getDrawStore(map_id);
  const state = store.state;
  if (!state.activated) {
    throw new Error('Need to call activateDraw first');
  }
  if (state.register_id && state.register_id !== register_id) {
    throw new Error('register id not match');
  }
}
export const draw = (
  map_id: string,
  register_id: string,
  type: string,
  callback?: DrawSaveFc,
  options?: any
) => {
  const store = getDrawStore(map_id);
  checkDrawId(map_id, register_id);
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
export const saveDraw = (
  map_id: string,
  register_id: string,
  callback?: DrawSaveFc
) => {
  const store = getDrawStore(map_id);
  const state = store.state;
  const action = store.action;
  checkDrawId(map_id, register_id);

  if (callback && !(callback instanceof Function)) {
    throw new Error('Callback is not available');
  }
  const result: DrawSaveFcParams = convertData(store);

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
  clearDraw(map_id);
  // deactivateDraw(map_id);
};
export function cancelDraw(map_id: string) {
  const store = getDrawStore(map_id);
  const state = store.state;
  clearDraw(map_id);
  state.activated = false;
  // deactivateDraw(map_id);
}
export const clearDraw = (map_id: string) => {
  const store = getDrawStore(map_id);
  const state = store.state;
  store.featuresAdded = {};
  store.featuresAdded = {};
  store.featuresDeleted = {};
  if (state.cleanAfterDone) {
    store.control.deleteAll();
  }
  store.control.changeMode('simple_select');
};
export function setFeature(
  map_id: string,
  type: 'added' | 'updated' | 'deleted',
  feature: Feature
) {
  const store = getDrawStore(map_id);
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
export function checkAndCallDone(map_id: string, register_id: string) {
  const store = getDrawStore(map_id);
  if (store.callback) {
    saveDraw(map_id, register_id, store.callback);
    store.callback = undefined;
  }
}
export function callDraw(map_id: string, option: DrawOption) {
  const register_id = getUUIDv4();
  const store = getDrawStore(map_id);
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

export const getDrawIsActivated = (map_id: string) =>
  getDrawStore(map_id).state.activated;
export const getDrawSupport = (map_id: string) =>
  getDrawStore(map_id).state.draw_support;

export const getDrawIsRegisterId = (map_id: string) =>
  getDrawStore(map_id).state.register_id;

export const getDrawIsShow = (map_id: string) =>
  getDrawStore(map_id).state.show;
export const getDrawAction = (map_id: string) => getDrawStore(map_id).action;
export const getDrawControl = (map_id: string) => getDrawStore(map_id).control;
