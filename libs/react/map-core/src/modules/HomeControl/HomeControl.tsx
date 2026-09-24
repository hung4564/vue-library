import type { MapSimple } from '@hungpvq/map-core';
import {
  captureHomeView,
  goHome,
  type HomeView,
  type WithMapPropType,
} from '@hungpvq/map-core';
import { mdiButtonState } from '@hungpvq/map-core/toolbar';
import { mdiHome } from '@mdi/js';
import React, { useCallback, useState } from 'react';

import { MapCommonButton } from '../../components/MapCommonButton';
import { useLang } from '../../extra/lang/hook';
import { useRegisterMapControl } from '../../extra/registry/useRegisterMapControl';
import { useToolbarControl } from '../../extra/toolbar/helper';
import { defaultMapProps, useMap } from '../../hooks/useMap';
import { ModuleContainer } from '../ModuleContainer/ModuleContainer';

export interface HomeControlProps extends WithMapPropType {
  zoom?: number;
  center?: number[];
}

export function HomeControl(props: HomeControlProps) {
  const mergedProps = { ...defaultMapProps, ...props };
  const [homeView, setHomeView] = useState<HomeView>({
    zoom: props.zoom || 0,
    center: { lat: 0, lng: 0 },
  });

  const onInit = useCallback(
    (_map: MapSimple) => {
      setHomeView(
        captureHomeView(_map, {
          zoom: props.zoom,
          center: props.center,
        }),
      );
    },
    [props.zoom, props.center],
  );

  const { callMap, mapId, moduleContainerProps, order } = useMap(
    { ...mergedProps, controlId: 'mapHomeControl' },
    onInit,
  );
  const { trans } = useLang(mapId);

  function onGoHome() {
    callMap((map) => {
      goHome(map, homeView);
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

  const { state, control } = useToolbarControl(mapId, mergedProps, {
    kind: 'single',
    id: 'mapHomeControl',
    getState: () =>
      mdiButtonState(mdiHome, {
        visible: true,
        title: trans('map.home.title'),
        order,
      }),
    onClick: () => onGoHome(),
  });

  return (
    <ModuleContainer
      {...moduleContainerProps}
      btn={
        state ? (
          <MapCommonButton
            option={state}
            onClick={(e) => {
              e.stopPropagation();
              control.onAction(e);
            }}
          />
        ) : null
      }
    />
  );
}
