import { logHelper } from '@hungpvq/shared-map';
import { createMapScopedStore } from '@hungpvq/vue-map-core';
import { BaseMapAdapter, DefaultBaseMapAdapter } from '../adapter/base';
import { logger } from '../logger';
import { BaseMapStore } from '../types';

const KEY = 'basemap';

export const useMapBaseMapStore = (mapId: string) =>
  createMapScopedStore<BaseMapStore>(mapId, KEY, () => {
    return {
      baseMaps: [],
      defaultBaseMap: '',
      current: undefined,
      loading: false,
      adapter: new DefaultBaseMapAdapter(),
    };
  });

export const useBaseMapAdapter = (mapId: string) => {
  const store = useMapBaseMapStore(mapId);
  return {
    setBaseMapAdapter(
      mapId: string,
      adapter: (mapId: string) => BaseMapAdapter,
    ) {
      logHelper(logger, mapId, 'store').debug('setBaseMapAdapter', adapter);
      store.adapter = adapter(mapId);
    },
  };
};
