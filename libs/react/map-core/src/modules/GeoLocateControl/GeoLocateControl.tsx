import {
  type GeoLocateControlOptions,
  GeoLocateSession,
  type GeoLocateUiState,
  type MapSimple,
  type WithMapPropType,
} from '@hungpvq/map-core';
import { mdiButtonState } from '@hungpvq/map-core/toolbar';
import { mdiCrosshairsGps, mdiCrosshairsOff } from '@mdi/js';
import { useEffect, useRef, useState } from 'react';

import { useLang } from '../../extra/lang/hook';
import { useMapControl } from '../../extra/registry/useMapControl';
import { defaultMapProps, useMap } from '../../hooks/useMap';
import { ModuleContainer } from '../ModuleContainer/ModuleContainer';

export type GeoLocateControlProps = WithMapPropType &
  GeoLocateControlOptions & {
    onGeolocate?: (position: GeolocationPosition) => void;
    onError?: (payload: { message: string; code?: number }) => void;
    onTrackUserLocationStart?: () => void;
    onTrackUserLocationEnd?: () => void;
  };

const INITIAL_UI: GeoLocateUiState = {
  watchState: 'OFF',
  active: false,
  locating: false,
  disabled: false,
  errorMessage: null,
  errorCode: null,
  background: false,
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
  const callbacksRef = useRef({
    onGeolocate: props.onGeolocate,
    onError: props.onError,
    onTrackUserLocationStart: props.onTrackUserLocationStart,
    onTrackUserLocationEnd: props.onTrackUserLocationEnd,
  });
  callbacksRef.current = {
    onGeolocate: props.onGeolocate,
    onError: props.onError,
    onTrackUserLocationStart: props.onTrackUserLocationStart,
    onTrackUserLocationEnd: props.onTrackUserLocationEnd,
  };

  const { callMap, mapId, order } = useMap(mergedProps, undefined, () => {
    sessionRef.current?.destroy();
    sessionRef.current = undefined;
  });
  const { trans } = useLang(mapId);

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

  function errorTitle(state: GeoLocateUiState) {
    if (state.errorCode === 1) {
      return trans('map.action.geolocate-control-permission-denied');
    }
    if (state.errorCode === 3) {
      return trans('map.action.geolocate-control-timeout');
    }
    return (
      state.errorMessage ||
      trans('map.action.geolocate-control-location-not-available')
    );
  }

  function getSession(map: MapSimple) {
    if (!sessionRef.current) {
      sessionRef.current = new GeoLocateSession({
        map,
        mapId,
        ...sessionOptions(),
        onStateChange: setUi,
        onGeolocate: (position) => callbacksRef.current.onGeolocate?.(position),
        onError: (payload) => callbacksRef.current.onError?.(payload),
        onTrackUserLocationStart: () =>
          callbacksRef.current.onTrackUserLocationStart?.(),
        onTrackUserLocationEnd: () =>
          callbacksRef.current.onTrackUserLocationEnd?.(),
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

  const error = ui.errorMessage;
  const { moduleContainerProps, control } = useMapControl(mapId, {
    id: 'mapGeoLocateControl',
    panelKind: 'button',
    from: mergedProps,
    order,
    getProps: () => ({ ...sessionOptions() }),
    actions: [
      {
        type: 'mapGeoLocateControl',
        run: () => {
          onClick();
        },
      },
    ],
    getButtonState() {
      return mdiButtonState(error ? mdiCrosshairsOff : mdiCrosshairsGps, {
        visible: true,
        active: ui.active,
        disabled: ui.disabled,
        loading: ui.locating,
        order,
        title: error
          ? errorTitle(ui)
          : ui.background
            ? trans('map.action.geolocate-control-tracking-background')
            : trans('map.action.geolocate-control-find-my-location'),
      });
    },
    onClick() {
      onClick();
    },
  });

  useEffect(() => {
    control.sync();
  }, [ui, control]);

  return <ModuleContainer {...moduleContainerProps} />;
}
