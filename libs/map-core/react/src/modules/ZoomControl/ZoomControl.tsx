import type { MapSimple, WithMapPropType } from '@hungpvq/map-core';
import {
  attachRotateListener,
  resetBearing,
  zoomIn,
  zoomOut,
} from '@hungpvq/map-core';
import { mdiButtonState } from '@hungpvq/map-core/toolbar';
import { mdiMinus, mdiPlus } from '@mdi/js';
import React, { useCallback, useState } from 'react';

import { useLang } from '../../extra/lang/hook';
import { useMapControl } from '../../extra/registry/useMapControl';
import { defaultMapProps, useMap } from '../../hooks/useMap';
import { ModuleContainer } from '../ModuleContainer/ModuleContainer';

export interface ZoomControlProps extends WithMapPropType {
  showCompass?: boolean;
  showZoom?: boolean;
}

export function ZoomControl({
  showCompass = true,
  showZoom = true,
  ...props
}: ZoomControlProps) {
  const mergedProps = { ...defaultMapProps, ...props };
  const [transform, setTransform] = useState('rotate(0deg)');
  const detachRotateRef = React.useRef<(() => void) | null>(null);

  const onInit = useCallback((_map: MapSimple) => {
    detachRotateRef.current = attachRotateListener(_map, (next) => {
      setTransform(next);
      controlRef.current?.sync();
    });
  }, []);

  const onDestroy = useCallback((_map: MapSimple) => {
    detachRotateRef.current?.();
    detachRotateRef.current = null;
  }, []);

  const { mapId, order, callMap } = useMap(mergedProps, onInit, onDestroy);
  const { trans } = useLang(mapId);

  const onZoomIn = useCallback(
    (e?: unknown) => {
      callMap((map) => {
        zoomIn(map, e);
      });
    },
    [callMap],
  );

  const onZoomOut = useCallback(
    (e?: unknown) => {
      callMap((map) => {
        zoomOut(map, e);
      });
    },
    [callMap],
  );

  const onResetBearing = useCallback(() => {
    callMap((map) => {
      resetBearing(map);
    });
  }, [callMap]);

  const navigationButtons = [
    {
      id: 'mapCompass',
      getState: () => ({
        visible: showCompass,
        title: trans('map.action.navigation-control-reset-bearing'),
        icon: {
          type: 'compass' as const,
          transform,
        },
      }),
      onClick: () => onResetBearing(),
    },
    {
      id: 'mapZoomIn',
      getState: () =>
        mdiButtonState(mdiPlus, {
          visible: showZoom,
          title: trans('map.action.navigation-control-zoom-in'),
        }),
      onClick: (e?: MouseEvent) => onZoomIn(e),
    },
    {
      id: 'mapZoomOut',
      getState: () =>
        mdiButtonState(mdiMinus, {
          visible: showZoom,
          title: trans('map.action.navigation-control-zoom-out'),
        }),
      onClick: (e?: MouseEvent) => onZoomOut(e),
    },
  ];

  const navigationModule = {
    kind: 'module' as const,
    moduleId: 'mapNavigationControl',
    order,
    buttons: navigationButtons,
  };

  const { moduleContainerProps, control } = useMapControl(mapId, {
    id: 'mapNavigationControl',
    panelKind: 'button',
    from: mergedProps,
    order,
    host: { button: navigationModule },
    defaultActionType: 'mapZoomIn',
    actions: [
      { type: 'mapCompass', run: () => onResetBearing() },
      { type: 'mapZoomIn', run: (e?: unknown) => onZoomIn(e) },
      { type: 'mapZoomOut', run: (e?: unknown) => onZoomOut(e) },
    ],
    toolbar: navigationModule,
  });
  const controlRef = React.useRef(control);
  controlRef.current = control;

  return <ModuleContainer {...moduleContainerProps} />;
}
