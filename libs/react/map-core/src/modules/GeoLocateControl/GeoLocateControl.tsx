import React, { useState, useEffect } from 'react';
import type { WithMapPropType } from '@hungpvq/map-core';
import { mdiCrosshairsGps, mdiCrosshairsOff } from '@mdi/js';
import { MapCommonButton } from '../../components/MapCommonButton';
import { useLang } from '../../extra';
import { defaultMapProps, useMap } from '../../hooks';
import { ModuleContainer } from '../ModuleContainer/ModuleContainer';
import type { MapControlButtonUIState } from '@hungpvq/map-core';

export function GeoLocateControl(props: WithMapPropType) {
  const mergedProps = { ...defaultMapProps, ...props };
  const [active, setActive] = useState(false);
  const { callMap, mapId, moduleContainerProps, order } = useMap(mergedProps);
  const { trans, setLocaleDefault } = useLang(mapId);

  useEffect(() => {
    setLocaleDefault({
      map: {
        action: {
          'geolocate-control-find-my-location': 'Find my location',
          'geolocate-control-location-not-available': 'Location not available',
        },
      },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function onClick() {
    if (!navigator.geolocation) {
      return;
    }

    callMap((map) => {
      if (!active) {
        setActive(true);
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const lngLat: [number, number] = [
              position.coords.longitude,
              position.coords.latitude,
            ];
            map.flyTo({
              center: lngLat,
              zoom: 14,
            });
          },
          () => {
            setActive(false);
          },
        );
      } else {
        setActive(false);
      }
    });
  }

  const buttonState: MapControlButtonUIState = {
    visible: true,
    active: active,
    order: order,
    title: trans('map.action.geolocate-control-find-my-location'),
    icon: {
      type: 'mdi',
      path: active ? mdiCrosshairsOff : mdiCrosshairsGps,
    },
  };

  return (
    <ModuleContainer
      {...moduleContainerProps}
      btn={
        <MapCommonButton
          option={buttonState}
          onClick={(e) => {
            e.stopPropagation();
            onClick();
          }}
        />
      }
    />
  );
}
