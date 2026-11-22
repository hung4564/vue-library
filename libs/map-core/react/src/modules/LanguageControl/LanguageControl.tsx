import {
  MAP_BUILTIN_LANGUAGES,
  type MapLangLocale,
  type MapLanguageCode,
  mapLanguageCodeLabel,
  type MapLocaleLoader,
  type MapTranslateFunction,
  nextMapLanguageInList,
  registerLanguageControlPacks,
  resolveInitialMapLanguage,
  type WithMapPropType,
} from '@hungpvq/map-core';
import { textButtonState } from '@hungpvq/map-core/toolbar';
import { useCallback, useEffect, useMemo, useRef } from 'react';

import { useLang } from '../../extra/lang/hook';
import { useMapControl } from '../../extra/registry/useMapControl';
import { defaultMapProps, useMap } from '../../hooks/useMap';
import { ModuleContainer } from '../ModuleContainer/ModuleContainer';

export type LanguageControlProps = WithMapPropType & {
  languages?: MapLanguageCode[];
  locales?: Record<string, MapLangLocale>;
  labels?: Record<string, string>;
  defaultLanguage?: MapLanguageCode;
  fallbackLanguage?: MapLanguageCode;
  localeLoader?: MapLocaleLoader;
  reloadOnSelect?: boolean;
  /** Plug in i18next / custom i18n; `null` clears. Catalog is passed as `fallback`. */
  translate?: MapTranslateFunction | null;
};

export function LanguageControl({
  languages,
  locales,
  labels,
  defaultLanguage = 'vi',
  fallbackLanguage,
  localeLoader,
  reloadOnSelect = false,
  translate: translateProp,
  ...props
}: LanguageControlProps) {
  const mergedProps = { ...defaultMapProps, ...props };
  const { mapId, order } = useMap(mergedProps);
  const {
    trans,
    language,
    registerLocale,
    registerLanguage,
    setLanguage,
    setFallbackLanguage,
    setTranslate,
    loadLocale,
    whenLocaleIdle,
  } = useLang(mapId);
  const applySeq = useRef(0);

  const languageList = useMemo(
    () =>
      (languages?.length ? languages : [...MAP_BUILTIN_LANGUAGES]).map(String),
    [languages],
  );

  const titleFor = useCallback(
    (code: MapLanguageCode) => {
      const fromProp = labels?.[code];
      if (fromProp) return fromProp;
      const key = `map.language-control.${code}`;
      const translated = trans(key);
      if (translated !== key) return translated;
      return mapLanguageCodeLabel(code);
    },
    [labels, trans],
  );

  useEffect(() => {
    registerLanguageControlPacks({
      registerLocale,
      registerLanguage,
      locales,
      labels,
      languages: languageList,
      resolveLabel: titleFor,
    });
    if (fallbackLanguage) setFallbackLanguage(fallbackLanguage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setTranslate(translateProp ?? null);
  }, [setTranslate, translateProp]);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      await whenLocaleIdle();
      if (cancelled) return;
      const initial = resolveInitialMapLanguage(
        languageList,
        defaultLanguage ?? 'vi',
      );
      if (localeLoader) {
        try {
          await loadLocale(initial, localeLoader);
        } catch {
          /* ignore */
        }
      }
      if (cancelled) return;
      setLanguage(initial);
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const applyLanguage = useCallback(
    async (code: MapLanguageCode) => {
      if (language === code) return;
      const seq = ++applySeq.current;
      if (localeLoader) {
        try {
          await loadLocale(code, localeLoader, { force: reloadOnSelect });
        } catch {
          /* keep switching even if loader fails */
        }
      }
      if (seq !== applySeq.current) return;
      setLanguage(code);
    },
    [language, loadLocale, localeLoader, reloadOnSelect, setLanguage],
  );

  const toggleLanguage = useCallback(() => {
    const next = nextMapLanguageInList(languageList, language);
    if (next) void applyLanguage(next);
  }, [applyLanguage, language, languageList]);

  const languageButtons = useMemo(
    () =>
      [...MAP_BUILTIN_LANGUAGES].map((code) => ({
        id: code,
        getState: () =>
          textButtonState(mapLanguageCodeLabel(code), {
            visible: languageList.includes(code),
            active: language === code,
            title: titleFor(code),
          }),
        onClick: () => void applyLanguage(code),
      })),
    [applyLanguage, language, languageList, titleFor],
  );

  const expandableChrome = useMemo(
    () => ({
      kind: 'module-expandable' as const,
      moduleId: 'mapLanguageControl',
      orientation: 'row' as const,
      order,
      expandableButton: ({ active }: { active: boolean }) =>
        textButtonState(mapLanguageCodeLabel(language), {
          active,
          title: `${trans('map.language-control.title')}: ${titleFor(language)}`,
        }),
      buttons: languageButtons,
    }),
    [order, language, languageButtons, titleFor, trans],
  );

  const { moduleContainerProps, control } = useMapControl(mapId, {
    id: 'mapLanguageControl',
    panelKind: 'button',
    from: mergedProps,
    order,
    host: { button: expandableChrome },
    actions: [
      {
        type: 'mapLanguageControl',
        run: () => toggleLanguage(),
      },
      ...languageList.map((code) => ({
        type: `mapLanguageControl:${code}`,
        run: () => void applyLanguage(code as MapLanguageCode),
      })),
    ],
    toolbar: expandableChrome,
  });

  useEffect(() => {
    control.sync();
  }, [language, titleFor, languageList, control]);

  return <ModuleContainer {...moduleContainerProps} />;
}
