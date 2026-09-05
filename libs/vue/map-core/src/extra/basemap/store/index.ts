import { BaseMapStore, logHelper } from '@hungpvq/map-core';
import { createMapScopedStore } from '../../../store/store';
import { BaseMapAdapter, DefaultBaseMapAdapter } from '../adapter/base';
import { logger } from '../logger';

const KEY = 'basemap' as const;

export const useMapBaseMapStore = (mapId: string) =>
  createMapScopedStore<BaseMapStore>(mapId, KEY as any, () => {
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
