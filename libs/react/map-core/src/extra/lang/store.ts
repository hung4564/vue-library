import {
  logHelper,
  MAP_STORE_KEY,
  createDefaultLangStore,
  createMapLocaleApi,
  type MapLocateStore,
  MittTypeMapLang,
} from '@hungpvq/map-core';
import { useMemo } from 'react';
import { createMapScopedStore } from '../../store/store';
import { getMapMittStore } from '../../store/mitt-store';
import { loggerFactory } from '@hungpvq/shared-log';

const logger = loggerFactory.createLogger().setNamespace('map:lang', 2);

export type MapLangStore = MapLocateStore;

export const useMapLocaleStore = (mapId: string) =>
  createMapScopedStore<MapLangStore>(mapId, MAP_STORE_KEY.LANG, () => {
    logHelper(logger, mapId, 'store').debug('init');
    return createDefaultLangStore();
  });

export const useMapLocale = (mapId: string) => {
  const store = useMapLocaleStore(mapId);
  return useMemo(
    () =>
      createMapLocaleApi({
        getStore: () => store,
        getEmitter: () => getMapMittStore<MittTypeMapLang>(mapId),
      }),
    [mapId, store],
  );
};
