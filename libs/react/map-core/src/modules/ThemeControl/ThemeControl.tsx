import { type WithMapPropType } from '@hungpvq/map-core';
import {
  MAP_THEME_COLOR_SCHEME,
  MAP_THEME_MODES,
  THEME_CONTROL_LOCALE,
  applyMapThemeClass,
  getMapThemeLocaleKey,
  getPrefersDark,
  getStoredMapThemeMode,
  normalizeMapThemeModes,
  resolveMapTheme,
  setStoredMapThemeMode,
  toggleMapThemeLightDark,
  type MapThemeMode,
} from '@hungpvq/map-core/theme';
import { mdiButtonState } from '@hungpvq/map-core/toolbar';
import {
  mdiCircleHalfFull,
  mdiPalette,
  mdiPineTree,
  mdiThemeLightDark,
  mdiWater,
  mdiWeatherNight,
  mdiWeatherSunny,
  mdiWeatherSunset,
} from '@mdi/js';
import { useEffect, useMemo, useState } from 'react';
import { MapCommonButton } from '../../components/MapCommonButton';
import { MapControlGroupButton } from '../../components/MapControlGroupButton';
import { useLang, useRegisterMapControl, useToolbarControl } from '../../extra';
import { defaultMapProps, useMap } from '../../hooks';
import { ModuleContainer } from '../ModuleContainer/ModuleContainer';

const MODE_ICONS: Record<MapThemeMode, string> = {
  auto: mdiThemeLightDark,
  light: mdiWeatherSunny,
  dark: mdiWeatherNight,
  vibrant: mdiPalette,
  ocean: mdiWater,
  forest: mdiPineTree,
  sunset: mdiWeatherSunset,
  slate: mdiCircleHalfFull,
};

export type ThemeControlProps = WithMapPropType & {
  themes?: MapThemeMode[];
};

export function ThemeControl({ themes, ...props }: ThemeControlProps) {
  const mergedProps = { ...defaultMapProps, ...props };
  const { mapId, moduleContainerProps, order } = useMap({
    ...mergedProps,
    controlId: 'mapThemeControl',
  });
  const { trans, setLocaleDefault } = useLang(mapId);
  const [mode, setMode] = useState<MapThemeMode>(() =>
    getStoredMapThemeMode('auto'),
  );
  const [prefersDark, setPrefersDark] = useState(() => getPrefersDark());

  const themeModes = useMemo(
    () => normalizeMapThemeModes(themes ?? MAP_THEME_MODES),
    [themes],
  );

  const resolved = useMemo(
    () => resolveMapTheme(mode, prefersDark),
    [mode, prefersDark],
  );
  const toggleTarget = useMemo(
    () => toggleMapThemeLightDark(resolved),
    [resolved],
  );
  const toggleIcon =
    MAP_THEME_COLOR_SCHEME[resolved] === 'dark'
      ? mdiWeatherSunny
      : mdiWeatherNight;

  useEffect(() => {
    setLocaleDefault(THEME_CONTROL_LOCALE);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    applyMapThemeClass(resolveMapTheme(mode, prefersDark));
  }, [mode, prefersDark]);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = (event: MediaQueryListEvent) => {
      setPrefersDark(event.matches);
    };
    setPrefersDark(mediaQuery.matches);
    if ('addEventListener' in mediaQuery) {
      mediaQuery.addEventListener('change', onChange);
      return () => mediaQuery.removeEventListener('change', onChange);
    }
    // @ts-expect-error deprecated API
    mediaQuery.addListener(onChange);
    // @ts-expect-error deprecated API
    return () => mediaQuery.removeListener(onChange);
  }, []);

  function applyMode(next: MapThemeMode) {
    setMode(next);
    setStoredMapThemeMode(next);
  }

  function toggleTheme() {
    applyMode(toggleTarget);
  }

  useRegisterMapControl(mapId, {
    id: 'mapThemeControl',
    panelKind: 'button',
    buttonPosition: mergedProps.position,
    getProps: () => ({
      position: mergedProps.position,
      controlLayout: mergedProps.controlLayout,
      themes: themeModes,
    }),
    actions: [
      {
        type: 'mapThemeControl',
        run: () => toggleTheme(),
      },
    ],
  });

  const titleKey = getMapThemeLocaleKey(toggleTarget);

  const { state, control } = useToolbarControl(mapId, mergedProps, {
    kind: 'single',
    id: 'mapThemeControl',
    getState: () =>
      mdiButtonState(toggleIcon, {
        visible: true,
        order,
        title: trans(titleKey),
      }),
    onClick: () => toggleTheme(),
  });

  useEffect(() => {
    control.sync();
  }, [mode, prefersDark, toggleIcon, titleKey, control]);

  return (
    <ModuleContainer
      {...moduleContainerProps}
      btn={
        <MapControlGroupButton
          row
          className="map-theme-control-group button-group-hover-expand"
        >
          {state ? (
            <MapCommonButton
              option={state}
              onClick={(e) => {
                e.stopPropagation();
                control.onAction(e);
              }}
            />
          ) : null}
          {themeModes.map((themeId) => (
            <MapCommonButton
              key={themeId}
              option={{
                visible: true,
                active: mode === themeId,
                title: trans(getMapThemeLocaleKey(themeId)),
                icon: { type: 'mdi', path: MODE_ICONS[themeId] },
              }}
              onClick={(e) => {
                e.stopPropagation();
                applyMode(themeId);
              }}
            />
          ))}
        </MapControlGroupButton>
      }
    />
  );
}
