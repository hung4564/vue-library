import { createStore } from '@hungpvq/shared';

export type PendingFunction = (mapId: string) => void;
const store = createStore<{
  pendingFunctions: Record<string, PendingFunction>;
  pendingRemoveFunctions: Record<string, PendingFunction>;
  mapIds: Record<string, Record<string, boolean>>;
}>('map.queue', {
  pendingFunctions: {},
  pendingRemoveFunctions: {},
  mapIds: {},
});
const pendingFunctions = store.pendingFunctions;
const pendingRemoveFunctions = store.pendingRemoveFunctions;
const mapIds = store.mapIds;
export function addToQueue(
  key: string,
  func: PendingFunction,
  funcRemove?: PendingFunction
) {
  pendingFunctions[key] = func;
  if (funcRemove) pendingRemoveFunctions[key] = funcRemove;
  runPending();
}
export function runPending() {
  for (const mapId in mapIds) {
    if (Object.prototype.hasOwnProperty.call(mapIds, mapId)) {
      const mapRun = mapIds[mapId];

      for (const key in pendingFunctions) {
        if (
          Object.prototype.hasOwnProperty.call(pendingFunctions, key) &&
          !mapRun[key]
        ) {
          const pendingFunction = pendingFunctions[key];
          pendingFunction(mapId);
          mapRun[key] = true;
        }
      }
    }
  }
}

export function addMapIdToQueue(mapId: string) {
  mapIds[mapId] = {};
  runPending();
}
export function removeMapIdFromQueue(mapId: string) {
  for (const key in pendingRemoveFunctions) {
    const mapRun = mapIds[mapId];
    if (
      Object.prototype.hasOwnProperty.call(pendingRemoveFunctions, key) &&
      !mapRun[key]
    ) {
      const pendingRemoveFunction = pendingRemoveFunctions[key];
      pendingRemoveFunction(mapId);
      mapRun[key] = true;
    }
  }
  mapIds[mapId] = {};
}
