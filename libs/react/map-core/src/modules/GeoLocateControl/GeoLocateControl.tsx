import {
  GeoLocateSession,
  MAP_ACTION_LOCALE,
  type GeoLocateControlOptions,
  type GeoLocateUiState,
  type MapSimple,
  type WithMapPropType,
} from '@hungpvq/map-core';
import { mdiCrosshairsGps, mdiCrosshairsOff } from '@mdi/js';
import { useEffect, useRef, useState } from 'react';
import { MapCommonButton } from '../../components/MapCommonButton';
import { useLang, useRegisterMapControl, useToolbarControl } from '../../extra';
import { defaultMapProps, useMap } from '../../hooks';
import { ModuleContainer } from '../ModuleContainer/ModuleContainer';

export type GeoLocateControlProps = WithMapPropType & GeoLocateControlOptions;

const INITIAL_UI: GeoLocateUiState = {
  watchState: 'OFF',
  active: false,
  locating: false,
  disabled: false,
  errorMessage: null,
};

export function GeoLocateControl(props: GeoLocateControlProps) {
  const mergedProps = {
    ...defaultMapProps,
    trackUserLocation: true,
    followUserLocation: true,
    showAccuracyCircle: true,
    showUserHeading: true,
    showUserLocation: true,
    ...props,
  };
  const [ui, setUi] = useState<GeoLocateUiState>(INITIAL_UI);
  const sessionRef = useRef<GeoLocateSession | undefined>(undefined);

  const { callMap, mapId, moduleContainerProps, order } = useMap(
    { ...mergedProps, controlId: 'mapGeoLocateControl' },
    undefined,
    () => {
      sessionRef.current?.destroy();
      sessionRef.current = undefined;
    },
  );
  const { trans, setLocaleDefault } = useLang(mapId);

  useEffect(() => {
    setLocaleDefault(MAP_ACTION_LOCALE);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setUi(INITIAL_UI);
    return () => {
      sessionRef.current?.destroy();
      sessionRef.current = undefined;
    };
  }, [
    mergedProps.trackUserLocation,
    mergedProps.followUserLocation,
    mergedProps.showAccuracyCircle,
    mergedProps.showUserHeading,
    mergedProps.showUserLocation,
    mergedProps.fitBoundsOptions,
    mergedProps.positionOptions,
    mergedProps.geolocation,
  ]);

  function sessionOptions() {
    return {
      trackUserLocation: mergedProps.trackUserLocation,
      followUserLocation: mergedProps.followUserLocation,
      showAccuracyCircle: mergedProps.showAccuracyCircle,
      showUserHeading: mergedProps.showUserHeading,
      showUserLocation: mergedProps.showUserLocation,
      fitBoundsOptions: mergedProps.fitBoundsOptions,
      positionOptions: mergedProps.positionOptions,
      geolocation: mergedProps.geolocation,
    };
  }

  function getSession(map: MapSimple) {
    if (!sessionRef.current) {
      sessionRef.current = new GeoLocateSession({
        map,
        mapId,
        ...sessionOptions(),
        onStateChange: setUi,
      });
    }
    return sessionRef.current;
  }

  function onClick() {
    GeoLocateSession.primeDeviceOrientationPermission();
    callMap((map) => {
      getSession(map).toggle();
    });
  }

  useRegisterMapControl(mapId, {
    id: 'mapGeoLocateControl',
    panelKind: 'button',
    buttonPosition: mergedProps.position,
    getProps: () => ({
      position: mergedProps.position,
      controlLayout: mergedProps.controlLayout,
      ...sessionOptions(),
    }),
    actions: [
      {
        type: 'mapGeoLocateControl',
        run: () => {
          onClick();
        },
      },
    ],
  });

  const error = ui.errorMessage;
  const { state, control } = useToolbarControl(mapId, mergedProps, {
    kind: 'single',
    id: 'mapGeoLocateControl',
    getState() {
      return {
        visible: true,
        active: ui.active,
        disabled: ui.disabled,
        order,
        title: error
          ? error ||
            trans('map.action.geolocate-control-location-not-available')
          : trans('map.action.geolocate-control-find-my-location'),
        icon: {
          type: 'mdi',
          path: error ? mdiCrosshairsOff : mdiCrosshairsGps,
        },
      };
    },
    onClick() {
      onClick();
    },
  });

  useEffect(() => {
    control.sync();
  }, [ui, control]);

  return (
    <ModuleContainer
      {...moduleContainerProps}
      btn={
        state ? (
          <MapCommonButton
            option={state}
            onClick={(e) => {
              e.stopPropagation();
              control.onAction(e.nativeEvent);
            }}
          />
        ) : undefined
      }
    />
  );
}
