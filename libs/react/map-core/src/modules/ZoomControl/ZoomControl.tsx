import type { MapSimple } from '@hungpvq/map-core';
import type { WithMapPropType } from '@hungpvq/map-core';
import {
  attachRotateListener,
  resetBearing,
  zoomIn,
  zoomOut,
} from '@hungpvq/map-core';
import {
  type MapControlButtonUIState,
  mdiButtonState,
} from '@hungpvq/map-core/toolbar';
import { mdiMinus, mdiPlus } from '@mdi/js';
import React, { useCallback, useState } from 'react';

import { MapCommonButton } from '../../components/MapCommonButton';
import { MapControlGroupButton } from '../../components/MapControlGroupButton';
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

  const { callMap, mapId, order } = useMap(mergedProps, onInit, onDestroy);
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

  const { moduleContainerProps, state, control } = useMapControl(mapId, {
    id: 'mapNavigationControl',
    panelKind: 'button',
    from: mergedProps,
    order,
    buttonSlot: 'custom',
    defaultActionType: 'mapZoomIn',
    getProps: () => ({
      showCompass,
      showZoom,
    }),
    actions: [
      { type: 'mapCompass', run: () => onResetBearing() },
      { type: 'mapZoomIn', run: (e?: unknown) => onZoomIn(e) },
      { type: 'mapZoomOut', run: (e?: unknown) => onZoomOut(e) },
    ],
    toolbar: {
      kind: 'module',
      moduleId: 'mapNavigationControl',
      order,
      buttons: [
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
      ],
    },
  });
  const controlRef = React.useRef(control);
  controlRef.current = control;

  const moduleState = state as
    Record<string, MapControlButtonUIState | undefined> | undefined;

  return (
    <ModuleContainer
      {...moduleContainerProps}
      btn={
        <MapControlGroupButton>
          {moduleState?.mapCompass ? (
            <MapCommonButton
              option={moduleState.mapCompass}
              onClick={(e) => {
                e.stopPropagation();
                control.onAction('mapCompass', e.nativeEvent);
              }}
            />
          ) : null}
          {moduleState?.mapZoomIn ? (
            <MapCommonButton
              option={moduleState.mapZoomIn}
              onClick={(e) => {
                e.stopPropagation();
                control.onAction('mapZoomIn', e.nativeEvent);
              }}
            />
          ) : null}
          {moduleState?.mapZoomOut ? (
            <MapCommonButton
              option={moduleState.mapZoomOut}
              onClick={(e) => {
                e.stopPropagation();
                control.onAction('mapZoomOut', e.nativeEvent);
              }}
            />
          ) : null}
        </MapControlGroupButton>
      }
    />
  );
}
