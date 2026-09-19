import {
  deepMergeLocale,
  type MapLangFlatMessages,
  type MapLangLocale,
  type MapLanguageCode,
} from '@hungpvq/map-core';
import { MAP_DATASET_LOCALE_EN, MAP_DATASET_LOCALE_VI } from '@hungpvq/map-dataset';
import { MAP_DRAW_LOCALE_EN, MAP_DRAW_LOCALE_VI } from '@hungpvq/map-draw';
import {
  BaseMapControl,
  GotoControl,
  HomeControl,
  InfoControl,
  LanguageControl,
  Map,
  MeasurementControl,
  MouseCoordinatesControl,
  ThemeControl,
  ZoomControl,
  useLang,
  useMapContext,
} from '@hungpvq/react-map-core';
import { useCallback, useMemo, useState } from 'react';
import { DemoHelpPanel } from '../components/DemoHelpPanel';
import { MapPageShell } from '../components/MapPageShell';
import { AsideControl } from '../layout/AsideControl';
import { DevtoolsControl } from '@hungpvq/react-map-devtools';

const FR_LOCALE: MapLangLocale = {
  map: {
    'language-control': {
      title: 'Langue',
      en: 'English',
      vi: 'Vietnamien',
      fr: 'Français',
    },
    home: { title: 'Vue par défaut' },
    basemap: { title: 'Fond de carte', setting: 'Réglages' },
    measurement: { title: 'Mesure' },
  },
};

function ReloadToggle({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  const { mapId } = useMapContext();
  const { language } = useLang(mapId);
  const label =
    language === 'en'
      ? 'Reload from API on each select'
      : 'Tải lại từ API mỗi lần chọn';
  return (
    <label
      style={{
        position: 'absolute',
        zIndex: 2,
        left: 12,
        bottom: 12,
        display: 'flex',
        gap: '0.5rem',
        alignItems: 'center',
        padding: '0.35rem 0.6rem',
        background: 'var(--map-surface, #fff)',
        borderRadius: 4,
        fontSize: '0.875rem',
      }}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      {label}
    </label>
  );
}

export function LanguagePage() {
  const [reloadOnSelect, setReloadOnSelect] = useState(false);
  const locales = useMemo(
    () => ({
      en: deepMergeLocale(MAP_DATASET_LOCALE_EN, MAP_DRAW_LOCALE_EN),
      vi: deepMergeLocale(MAP_DATASET_LOCALE_VI, MAP_DRAW_LOCALE_VI),
      fr: FR_LOCALE,
    }),
    [],
  );

  const localeLoader = useCallback(async (lang: MapLanguageCode) => {
    try {
      const base = import.meta.env.BASE_URL || '/';
      const res = await fetch(
        `${base}demo-i18n/${lang}.json`.replace(/\/{2,}/g, '/'),
      );
      if (!res.ok) return null;
      return (await res.json()) as MapLangFlatMessages;
    } catch {
      return null;
    }
  }, []);

  return (
    <MapPageShell>
      <Map>
        <DevtoolsControl position="bottom-right" />
        <AsideControl position="top-left" />
        <LanguageControl
          defaultLanguage="vi"
          languages={['en', 'vi', 'fr']}
          labels={{ en: 'English', vi: 'Tiếng Việt', fr: 'Français' }}
          locales={locales}
          localeLoader={localeLoader}
          reloadOnSelect={reloadOnSelect}
        />
        <ThemeControl />
        <HomeControl />
        <ZoomControl />
        <GotoControl position="top-right" />
        <InfoControl position="top-right" />
        <MeasurementControl position="top-right" />
        <BaseMapControl position="bottom-left" />
        <MouseCoordinatesControl />
        <DemoHelpPanel />
        <ReloadToggle checked={reloadOnSelect} onChange={setReloadOnSelect} />
      </Map>
    </MapPageShell>
  );
}
