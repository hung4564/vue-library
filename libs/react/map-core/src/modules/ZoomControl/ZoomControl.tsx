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
  mdiIcon,
} from '@hungpvq/map-core/toolbar';
import { mdiMinus, mdiPlus } from '@mdi/js';
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import { MapCommonButton } from '../../components/MapCommonButton';
import { MapControlGroupButton } from '../../components/MapControlGroupButton';
import { useLang } from '../../extra/lang/hook';
import { useRegisterMapControl } from '../../extra/registry/useRegisterMapControl';
import { useToolbarControl } from '../../extra/toolbar/helper';
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
  const detachRotateRef = useRef<(() => void) | null>(null);

  const onInit = useCallback((_map: MapSimple) => {
    detachRotateRef.current = attachRotateListener(_map, setTransform);
  }, []);

  const onDestroy = useCallback((_map: MapSimple) => {
    detachRotateRef.current?.();
    detachRotateRef.current = null;
  }, []);

  const { callMap, mapId, moduleContainerProps, order } = useMap(
    { ...mergedProps, controlId: 'mapNavigationControl' },
    onInit,
    onDestroy,
  );
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
  const registerActions = useMemo(
    () => [
      { type: 'mapCompass', run: () => onResetBearing() },
      { type: 'mapZoomIn', run: (e?: unknown) => onZoomIn(e) },
      { type: 'mapZoomOut', run: (e?: unknown) => onZoomOut(e) },
    ],
    [onResetBearing, onZoomIn, onZoomOut],
  );

  useRegisterMapControl(mapId, {
    id: 'mapNavigationControl',
    panelKind: 'button',
    buttonPosition: mergedProps.position,
    defaultActionType: 'mapZoomIn',
    getProps: () => ({
      position: mergedProps.position,
      controlLayout: mergedProps.controlLayout,
      showCompass,
      showZoom,
    }),
    actions: registerActions,
  });

  const compassButton = useMemo(
    () => ({
      id: 'mapCompass',
      getState: () => ({
        visible: showCompass,
        title: trans('map.action.navigation-control-reset-bearing'),
        icon: {
          type: 'compass' as const,
          transform: transform,
        },
      }),
      onClick: () => onResetBearing(),
    }),
    [showCompass, trans, transform, onResetBearing],
  );

  const zoomInButton = useMemo(
    () => ({
      id: 'mapZoomIn',
      getState: () => ({
        visible: showZoom,
        title: trans('map.action.navigation-control-zoom-in'),
        icon: mdiIcon(mdiPlus),
      }),
      onClick: (e?: MouseEvent) => onZoomIn(e),
    }),
    [showZoom, trans, onZoomIn],
  );

  const zoomOutButton = useMemo(
    () => ({
      id: 'mapZoomOut',
      getState: () => ({
        visible: showZoom,
        title: trans('map.action.navigation-control-zoom-out'),
        icon: mdiIcon(mdiMinus),
      }),
      onClick: (e?: MouseEvent) => onZoomOut(e),
    }),
    [showZoom, trans, onZoomOut],
  );

  const toolbarConfig = useMemo(
    () => ({
      kind: 'module' as const,
      moduleId: 'mapNavigationControl',
      order: order,
      buttons: [compassButton, zoomInButton, zoomOutButton],
    }),
    [order, compassButton, zoomInButton, zoomOutButton],
  );

  const { control, state } = useToolbarControl(
    mapId,
    mergedProps,
    toolbarConfig,
  );

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
                compassButton.onClick?.();
                control.sync();
              }}
            />
          ) : null}
          {moduleState?.mapZoomIn ? (
            <MapCommonButton
              option={moduleState.mapZoomIn}
              onClick={(e) => {
                e.stopPropagation();
                zoomInButton.onClick?.(e.nativeEvent);
                control.sync();
              }}
            />
          ) : null}
          {moduleState?.mapZoomOut ? (
            <MapCommonButton
              option={moduleState.mapZoomOut}
              onClick={(e) => {
                e.stopPropagation();
                zoomOutButton.onClick?.(e.nativeEvent);
                control.sync();
              }}
            />
          ) : null}
        </MapControlGroupButton>
      }
    />
  );
}
