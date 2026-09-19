import { logHelper, MAP_STORE_KEY } from '@hungpvq/map-core';
import {
  type BaseMapAdapter,
  BaseMapStore,
  logger,
} from '@hungpvq/map-core/basemap';
import { createMapScopedStore } from '../../store/store';
import { DefaultBaseMapAdapter } from './adapter/base';

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
      logHelper(logger, mapId, 'store')
        .with({ fn: 'setBaseMapAdapter', span: 'store.update' })
        .debug('Base map adapter assigned for mapId.');
      store.adapter = adapter(mapId);
    },
  };
};
