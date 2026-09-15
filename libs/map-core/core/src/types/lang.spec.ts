import { describe, expect, it } from 'vitest';
import {
  createDefaultLangStore,
  createMapLocaleApi,
  MittTypeMapLangEventKey,
} from './lang';

describe('createMapLocaleApi', () => {
  it('merges locale and emits setLocale', () => {
    const store = createDefaultLangStore();
    const emitted: unknown[] = [];
    const api = createMapLocaleApi({
      getStore: () => store,
      getEmitter: () => ({
        emit: (_key, payload) => emitted.push(payload),
      }),
    });

    api.setMapLang({ foo: 'bar' });
    expect(store.locale).toEqual({ foo: 'bar' });
    expect(emitted).toEqual([{ foo: 'bar' }]);
  });

  it('sets translate and emits setTranslate', () => {
    const store = createDefaultLangStore();
    const emitted: string[] = [];
    const translate = (key: string) => key.toUpperCase();
    const api = createMapLocaleApi({
      getStore: () => store,
      getEmitter: () => ({
        emit: (key) => emitted.push(key),
      }),
    });

    api.setMapTranslate(translate);
    expect(store.translate).toBe(translate);
    expect(emitted).toEqual([MittTypeMapLangEventKey.setTranslate]);
  });

  it('returns store via getMapLang', () => {
    const store = createDefaultLangStore();
    const api = createMapLocaleApi({ getStore: () => store });
    expect(api.getMapLang()).toBe(store);
  });
});
