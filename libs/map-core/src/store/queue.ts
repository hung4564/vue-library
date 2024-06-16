export type PendingFunction = (mapId: string) => void;
let pendingFunctions: Record<string, PendingFunction> = {};
let pendingRemoveFunctions: Record<string, PendingFunction> = {};
let mapIds: Record<string, Record<string, boolean>> = {};
if (window.$_hungpv_map_queue) {
  pendingFunctions = window.$_hungpv_map_queue.pendingFunctions;
  pendingRemoveFunctions = window.$_hungpv_map_queue.pendingRemoveFunctions;
  mapIds = window.$_hungpv_map_queue.mapIds;
} else {
  window.$_hungpv_map_queue = {
    pendingFunctions,
    pendingRemoveFunctions,
    mapIds,
  };
}
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
