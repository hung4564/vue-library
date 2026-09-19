import { type WithMapPropType, subscribeMapReady } from '@hungpvq/map-core';
import {
  MAP_THEME_COLOR_SCHEME,
  MAP_THEME_MODES,
  applyMapTheme,
  getMapThemeLocaleKey,
  getPrefersDark,
  getStoredMapThemeMode,
  normalizeMapThemeModes,
  resolveMapTheme,
  setStoredMapThemeMode,
  subscribePrefersContrastMore,
  toggleMapThemeLightDark,
  type MapThemeMode,
  type MapThemeScope,
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
import { useLang } from '../../extra/lang/hook';
import { useRegisterMapControl } from '../../extra/registry/useRegisterMapControl';
import { useToolbarControl } from '../../extra/toolbar/helper';
import { defaultMapProps, useMap } from '../../hooks/useMap';
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
  /**
   * `document` (default): `html` + mirror on this map shell (page-wide chrome).
   * `map`: only `.map-container[data-map-id]` + per-map localStorage.
   */
  scope?: MapThemeScope;
};

export function ThemeControl({
  themes,
  scope = 'document',
  ...props
}: ThemeControlProps) {
  const mergedProps = { ...defaultMapProps, ...props };
  const { mapId, moduleContainerProps, order } = useMap({
    ...mergedProps,
    controlId: 'mapThemeControl',
  });
  const { trans } = useLang(mapId);
  const storageOpts = scope === 'map' ? { mapId } : undefined;
  const [mode, setMode] = useState<MapThemeMode>(() =>
    getStoredMapThemeMode('auto', storageOpts),
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
    setMode(getStoredMapThemeMode('auto', storageOpts));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scope, mapId]);

  useEffect(() => {
    applyMapTheme(resolveMapTheme(mode, prefersDark), { scope, mapId });
  }, [mode, prefersDark, scope, mapId]);

  useEffect(() => {
    if (scope !== 'map') return;
    return subscribeMapReady(mapId, () => {
      applyMapTheme(resolveMapTheme(mode, prefersDark), { scope, mapId });
    });
  }, [scope, mapId, mode, prefersDark]);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = (event: MediaQueryListEvent) => {
      setPrefersDark(event.matches);
    };
    setPrefersDark(mediaQuery.matches);
    mediaQuery.addEventListener('change', onChange);
    return () => mediaQuery.removeEventListener('change', onChange);
  }, []);

  useEffect(
    () =>
      subscribePrefersContrastMore(() => {
        applyMapTheme(resolveMapTheme(mode, prefersDark), { scope, mapId });
      }),
    [mode, prefersDark, scope, mapId],
  );

  function applyMode(next: MapThemeMode) {
    setMode(next);
    setStoredMapThemeMode(next, storageOpts);
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
      scope,
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
          className="button-group-hover-expand"
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
