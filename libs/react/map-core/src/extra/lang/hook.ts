import { useCallback, useEffect, useState } from 'react';
import { useMapMittStore } from '../mitt';
import { useMapLocale } from './store';
import {
  type MapLangLocale,
  type MittTypeMapLang,
  MittTypeMapLangEventKey,
} from '@hungpvq/map-core';

const propCache = new Map<object, Map<string, string | undefined>>();

export function useLang(mapId: string) {
  if (!mapId) throw new Error('mapId is required');
  const { getMapLang, setMapLang, setMapLocaleDefault, setMapTranslate } =
    useMapLocale(mapId);
  const [tick, setTick] = useState(0);
  const emitter = useMapMittStore<MittTypeMapLang>(mapId);

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
      const storeLang = getMapLang();
      if (storeLang?.translate) {
        return storeLang.translate(key, params);
      }
      const fromLocale = getProp(storeLang?.locale, key);
      if (fromLocale !== undefined) {
        return interpolate(fromLocale, params);
      }
      const fromDefault = getProp(storeLang?.localeDefault, key);
      if (fromDefault !== undefined) {
        return interpolate(fromDefault, params);
      }
      return key;
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

function getProp(
  object: object | undefined,
  path: string | string[],
  defaultVal?: string,
): string | undefined {
  if (!object) return defaultVal;
  if (!path) return defaultVal;
  const pathStr = Array.isArray(path) ? path.join('.') : path;
  let objCache = propCache.get(object);
  if (!objCache) {
    objCache = new Map();
    propCache.set(object, objCache);
  }
  if (objCache.has(pathStr)) {
    return objCache.get(pathStr);
  }
  const _path = Array.isArray(path) ? path : path.split('.').filter(Boolean);
  let current: unknown = object;
  for (const segment of _path) {
    if (
      current &&
      typeof current === 'object' &&
      segment in (current as Record<string, unknown>)
    ) {
      current = (current as Record<string, unknown>)[segment];
    } else {
      return defaultVal;
    }
  }
  const result = typeof current === 'string' ? current : defaultVal;
  if (result !== undefined) {
    objCache.set(pathStr, result);
  }
  return result;
}

function interpolate(text: string, params?: MapLangLocale): string {
  if (!text) return '';
  if (!params) return text;
  return text.replace(/\{(\w+)\}/g, (match, key) => {
    const value = params[key];
    return value !== undefined ? String(value) : match;
  });
}
