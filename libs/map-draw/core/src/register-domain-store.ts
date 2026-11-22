import {
  ensureMapDomainStore,
  ensureMapMitt,
  logHelper,
  registerMapDomainStoreFactory,
} from '@hungpvq/map-core';

import { logger } from './logger';
import { createDefaultMapDrawStore } from './store-helpers';
import { MAP_DRAW_STORE_KEY } from './store-key';
import {
  MAP_DRAW_EVENT,
  type MapDrawEvent,
  type MapDrawStore,
} from './types/index';

function endDrawSession(mapId: string, store: MapDrawStore): void {
  if (!store.config) return;
  store.config = undefined;
  store.state.featuresAdded = {};
  store.state.featuresUpdated = {};
  store.state.featuresDeleted = {};
  logHelper(logger, mapId, 'store')
    .with({ fn: 'endDrawSession', span: 'store.clear' })
    .debug('end on removeMap');
  ensureMapMitt<MapDrawEvent>(mapId).emit(MAP_DRAW_EVENT.END, { mapId });
}

registerMapDomainStoreFactory(MAP_DRAW_STORE_KEY, {
  create: () => createDefaultMapDrawStore(),
  cleanup: (mapId, store) => {
    endDrawSession(mapId, store as MapDrawStore);
  },
});

/** Get or create the draw session bag for `mapId`. */
export function ensureMapDrawStore(mapId: string): MapDrawStore {
  return ensureMapDomainStore<MapDrawStore>(mapId, MAP_DRAW_STORE_KEY);
}
