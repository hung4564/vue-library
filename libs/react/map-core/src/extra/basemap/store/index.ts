import {
  type BaseMapAdapter,
  BaseMapStore,
  logHelper,
  MAP_STORE_KEY,
} from '@hungpvq/map-core';
import { createMapScopedStore } from '../../../store/store';
import { DefaultBaseMapAdapter } from '../adapter/base';
import { logger } from '../logger';

export const useMapBaseMapStore = (mapId: string) =>
  createMapScopedStore<BaseMapStore>(mapId, MAP_STORE_KEY.BASEMAP, () => {
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
