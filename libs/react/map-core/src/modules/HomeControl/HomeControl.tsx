import React, { useState, useCallback, useEffect } from 'react';
import type { MapSimple } from '@hungpvq/map-core';
import { HOME_CONTROL_LOCALE, type WithMapPropType } from '@hungpvq/map-core';
import { mdiHome } from '@mdi/js';
import { MapCommonButton } from '../../components/MapCommonButton';
import { useLang, useRegisterMapControl } from '../../extra';
import { defaultMapProps, useMap } from '../../hooks';
import { ModuleContainer } from '../ModuleContainer/ModuleContainer';
import type { MapControlButtonUIState } from '@hungpvq/map-core';

export interface HomeControlProps extends WithMapPropType {
  zoom?: number;
  center?: number[];
}

export function HomeControl(props: HomeControlProps) {
  const mergedProps = { ...defaultMapProps, ...props };
  const [center, setCenter] = useState({ lat: 0, lng: 0 });
  const [zoom, setZoom] = useState(props.zoom || 0);

  const onInit = useCallback(
    (_map: MapSimple) => {
      if (props.zoom != null) {
        setZoom(props.zoom);
      } else {
        setZoom(_map.getZoom());
      }
      if (props.center != null) {
        setCenter({ lat: props.center[1], lng: props.center[0] });
      } else {
        setCenter(_map.getCenter());
      }
    },
    [props.zoom, props.center],
  );

  const { callMap, mapId, moduleContainerProps, order } = useMap(
    { ...mergedProps, controlId: 'mapHomeControl' },
    onInit,
  );
  const { trans, setLocaleDefault } = useLang(mapId);

  useEffect(() => {
    setLocaleDefault(HOME_CONTROL_LOCALE);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function onGoHome() {
    callMap((map) => {
      map.setZoom(zoom);
      map.setCenter(center);
    });
  }

  useRegisterMapControl(mapId, {
    id: 'mapHomeControl',
    panelKind: 'button',
    buttonPosition: mergedProps.position,
    getProps: () => ({
      position: mergedProps.position,
      controlLayout: mergedProps.controlLayout,
    }),
    actions: [
      {
        type: 'mapHomeControl',
        run: () => {
          onGoHome();
        },
      },
    ],
  });

  const buttonState: MapControlButtonUIState = {
    visible: true,
    title: trans('map.home.title'),
    order: order,
    icon: {
      type: 'mdi',
      path: mdiHome,
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
            onGoHome();
          }}
        />
      }
    />
  );
}
