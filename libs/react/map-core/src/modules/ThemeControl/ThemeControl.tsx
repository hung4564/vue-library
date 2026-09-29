import { subscribeMapReady, type WithMapPropType } from '@hungpvq/map-core';
import {
  applyMapTheme,
  getMapThemeLocaleKey,
  getPrefersDark,
  getStoredMapThemeMode,
  MAP_THEME_COLOR_SCHEME,
  MAP_THEME_MODES,
  type MapThemeMode,
  type MapThemeScope,
  normalizeMapThemeModes,
  resolveMapTheme,
  setStoredMapThemeMode,
  subscribePrefersContrastMore,
  toggleMapThemeLightDark,
} from '@hungpvq/map-core/theme';
import {
  ensureMapToolbarApi,
  type MapControlButtonUIState,
  mdiButtonState,
} from '@hungpvq/map-core/toolbar';
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
import { useMapControl } from '../../extra/registry/useMapControl';
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
  const { mapId, order } = useMap(mergedProps);
  const { trans } = useLang(mapId);
  const storageOpts = scope === 'map' ? { mapId } : undefined;
  const [mode, setMode] = useState<MapThemeMode>(() =>
    getStoredMapThemeMode('auto', storageOpts),
  );
  const [prefersDark, setPrefersDark] = useState(() => getPrefersDark());
  const [groupExpanded, setGroupExpanded] = useState(false);

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
    setGroupExpanded(false);
    if (mapId) ensureMapToolbarApi(mapId).setExpandedModule(null);
  }

  function toggleTheme() {
    applyMode(toggleTarget);
  }

  const titleKey = getMapThemeLocaleKey(toggleTarget);

  const {
    moduleContainerProps,
    state: moduleState,
    control,
  } = useMapControl(mapId, {
    id: 'mapThemeControl',
    panelKind: 'button',
    from: mergedProps,
    order,
    buttonSlot: 'custom',
    getProps: () => ({
      themes: themeModes,
      scope,
    }),
    actions: [
      {
        type: 'mapThemeControl',
        run: () => toggleTheme(),
      },
      ...MAP_THEME_MODES.map((themeId) => ({
        type: `mapThemeControl:${themeId}`,
        run: () => applyMode(themeId),
      })),
    ],
    toolbar: {
      kind: 'module-expandable',
      moduleId: 'mapThemeControl',
      orientation: 'row',
      order,
      expandableButton: ({ active }) =>
        mdiButtonState(toggleIcon, {
          visible: true,
          active,
          order,
          title: trans(titleKey),
        }),
      buttons: MAP_THEME_MODES.map((themeId) => ({
        id: themeId,
        getState: () =>
          mdiButtonState(MODE_ICONS[themeId], {
            visible: themeModes.includes(themeId),
            active: mode === themeId,
            title: trans(getMapThemeLocaleKey(themeId)),
          }),
        onClick: () => applyMode(themeId),
      })),
    },
  });

  const launcherState = (
    moduleState as Record<string, MapControlButtonUIState> | undefined
  )?.launcher;

  useEffect(() => {
    control.sync();
  }, [mode, prefersDark, toggleIcon, titleKey, themeModes, control]);

  return (
    <ModuleContainer
      {...moduleContainerProps}
      btn={
        <MapControlGroupButton
          row
          className={`button-group-click-expand${groupExpanded ? ' is-expanded' : ''}`}
        >
          {launcherState ? (
            <MapCommonButton
              option={launcherState}
              onClick={(e) => {
                e.stopPropagation();
                setGroupExpanded((v) => !v);
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
