import { translateMapLang } from '@hungpvq/map-core';
import { useCallback, useEffect, useState } from 'react';
import { getMapMittStore } from '../../store/mitt-store';
import { useMapLocale } from './store';
import {
  type MapLangLocale,
  type MittTypeMapLang,
  MittTypeMapLangEventKey,
} from '@hungpvq/map-core';

export function useLang(mapId: string) {
  if (!mapId) throw new Error('mapId is required');
  const { getMapLang, setMapLang, setMapLocaleDefault, setMapTranslate } =
    useMapLocale(mapId);
  const [tick, setTick] = useState(0);
  const emitter = getMapMittStore<MittTypeMapLang>(mapId);

  useEffect(() => {
    const update = () => setTick((t) => t + 1);
    emitter.on(MittTypeMapLangEventKey.setLocale, update);
    emitter.on(MittTypeMapLangEventKey.setTranslate, update);
    return () => {
      emitter.off(MittTypeMapLangEventKey.setLocale, update);
      emitter.off(MittTypeMapLangEventKey.setTranslate, update);
    };
  }, [emitter]);

  const trans = useCallback(
    (key: string, params?: MapLangLocale) => {
      void tick;
      return translateMapLang(getMapLang(), key, params);
    },
    [getMapLang, tick],
  );

  return {
    trans,
    setLocale: setMapLang,
    setLocaleDefault: setMapLocaleDefault,
    setTranslate: setMapTranslate,
  };
}
