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

import { useLang } from '../../extra/lang/hook';
import { useMapControl } from '../../extra/registry/useMapControl';
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

  const { callMap, mapId, order } = useMap(mergedProps, onInit);
  const { trans } = useLang(mapId);

  function onGoHome() {
    callMap((map) => {
      goHome(map, homeView);
    });
  }

  const singleButton = {
    kind: 'single' as const,
    getState: () =>
      mdiButtonState(mdiHome, {
        visible: true,
        title: trans('map.home.title'),
        order,
      }),
    onClick: () => onGoHome(),
  };

  const { moduleContainerProps } = useMapControl(mapId, {
    id: 'mapHomeControl',
    panelKind: 'button',
    from: mergedProps,
    order,
    actions: [
      {
        type: 'mapHomeControl',
        run: () => {
          onGoHome();
        },
      },
    ],
    host: { button: singleButton },
    toolbar: singleButton,
  });

  return <ModuleContainer {...moduleContainerProps} />;
}
