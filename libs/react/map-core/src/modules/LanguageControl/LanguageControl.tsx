import {
  MAP_BUILTIN_LANGUAGES,
  MAP_CORE_LOCALE_EN,
  MAP_CORE_LOCALE_VI,
  deepMergeLocale,
  getStoredMapLanguage,
  type MapLangLocale,
  type MapLanguageCode,
  type MapLocaleLoader,
  type MapTranslateFunction,
  type WithMapPropType,
} from '@hungpvq/map-core';
import { textButtonState } from '@hungpvq/map-core/toolbar';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import { MapCommonButton } from '../../components/MapCommonButton';
import { MapControlGroupButton } from '../../components/MapControlGroupButton';
import { useLang } from '../../extra/lang/hook';
import { useRegisterMapControl } from '../../extra/registry/useRegisterMapControl';
import { useToolbarControl } from '../../extra/toolbar/helper';
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

function codeLabel(code: MapLanguageCode): string {
  return String(code).toUpperCase();
}

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
  const { mapId, moduleContainerProps, order } = useMap({
    ...mergedProps,
    controlId: 'mapLanguageControl',
  });
  const {
    trans,
    language,
    registerLocale,
    registerLanguage,
    setLanguage,
    setFallbackLanguage,
    setTranslate,
    loadLocale,
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
      return codeLabel(code);
    },
    [labels, trans],
  );

  useEffect(() => {
    registerLocale(
      'en',
      deepMergeLocale(MAP_CORE_LOCALE_EN, locales?.en ?? {}),
    );
    registerLocale(
      'vi',
      deepMergeLocale(MAP_CORE_LOCALE_VI, locales?.vi ?? {}),
    );
    for (const [code, tree] of Object.entries(locales ?? {})) {
      if (code === 'en' || code === 'vi') continue;
      registerLocale(code, tree);
    }
    for (const code of languageList) {
      registerLanguage(code, { label: labels?.[code] ?? titleFor(code) });
    }
    if (fallbackLanguage) setFallbackLanguage(fallbackLanguage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setTranslate(translateProp ?? null);
  }, [setTranslate, translateProp]);

  useEffect(() => {
    const fallback = defaultLanguage ?? 'vi';
    const stored = getStoredMapLanguage(fallback);
    const initial = languageList.includes(stored) ? stored : fallback;
    setLanguage(initial);
    if (localeLoader) {
      void loadLocale(initial, localeLoader).catch(() => {
        /* ignore */
      });
    }
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
    if (!languageList.length) return;
    const idx = languageList.indexOf(language);
    const next = languageList[(idx + 1) % languageList.length]!;
    void applyLanguage(next);
  }, [applyLanguage, language, languageList]);

  useRegisterMapControl(mapId, {
    id: 'mapLanguageControl',
    panelKind: 'button',
    buttonPosition: mergedProps.position,
    getProps: () => ({
      position: mergedProps.position,
      controlLayout: mergedProps.controlLayout,
      languages: languageList,
      defaultLanguage,
      fallbackLanguage,
    }),
    actions: [
      {
        type: 'mapLanguageControl',
        run: () => toggleLanguage(),
      },
    ],
  });

  const { state, control } = useToolbarControl(mapId, mergedProps, {
    kind: 'single',
    id: 'mapLanguageControl',
    getState: () =>
      textButtonState(codeLabel(language), {
        visible: true,
        active: true,
        order,
        title: `${trans('map.language-control.title')}: ${titleFor(language)}`,
      }),
    onClick: () => toggleLanguage(),
  });

  useEffect(() => {
    control.sync();
  }, [language, titleFor, control]);

  return (
    <ModuleContainer
      {...moduleContainerProps}
      btn={
        <MapControlGroupButton
          row
          className="map-language-control-group button-group-hover-expand"
        >
          {/* DOM: current first (collapsed face), then all chips. Click current → cycle. */}
          {state ? (
            <MapCommonButton
              option={state}
              onClick={(e) => {
                e.stopPropagation();
                control.onAction(e);
              }}
            />
          ) : null}
          {languageList.map((code) => (
            <MapCommonButton
              key={code}
              option={textButtonState(codeLabel(code), {
                visible: true,
                active: language === code,
                title: titleFor(code),
              })}
              onClick={(e) => {
                e.stopPropagation();
                void applyLanguage(code);
              }}
            />
          ))}
        </MapControlGroupButton>
      }
    />
  );
}
