import React, {
  useState,
  useCallback,
  useRef,
  useEffect,
  useMemo,
} from 'react';
import type { MapSimple } from '@hungpvq/map-core';
import type { WithMapPropType } from '@hungpvq/map-core';
import { mdiMinus, mdiPlus } from '@mdi/js';
import { MapCommonButton } from '../../components/MapCommonButton';
import { MapControlGroupButton } from '../../components/MapControlGroupButton';
import { useLang, useToolbarControl } from '../../extra';
import { defaultMapProps, useMap } from '../../hooks';
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
  const bindSyncRotateRef = useRef<(() => void) | null>(null);

  function syncRotate(_map: MapSimple) {
    const angle = _map.getBearing() * -1;
    setTransform(`rotate(${angle}deg)`);
  }

  const onInit = useCallback((_map: MapSimple) => {
    bindSyncRotateRef.current = () => syncRotate(_map);
    if (bindSyncRotateRef.current) {
      _map.on('rotate', bindSyncRotateRef.current);
    }
  }, []);

  const onDestroy = useCallback((_map: MapSimple) => {
    if (bindSyncRotateRef.current) {
      _map.off('rotate', bindSyncRotateRef.current);
      bindSyncRotateRef.current = null;
    }
  }, []);

  const { callMap, mapId, moduleContainerProps, order } = useMap(
    mergedProps,
    onInit,
    onDestroy,
  );
  const { trans, setLocaleDefault } = useLang(mapId);

  useEffect(() => {
    setLocaleDefault({
      map: {
        action: {
          'navigation-control-zoom-in': 'Zoom in',
          'navigation-control-zoom-out': 'Zoom out',
          'navigation-control-reset-bearing': 'Reset bearing to north',
        },
      },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onZoomIn = useCallback(
    (e: React.MouseEvent) => {
      callMap((map) => {
        map.zoomIn({}, { originalEvent: e.nativeEvent });
      });
    },
    [callMap],
  );

  const onZoomOut = useCallback(
    (e: React.MouseEvent) => {
      callMap((map) => {
        map.zoomOut({}, { originalEvent: e.nativeEvent });
      });
    },
    [callMap],
  );

  const onResetBearing = useCallback(() => {
    callMap((map) => {
      map.easeTo({ bearing: 0, pitch: 0 });
    });
  }, [callMap]);

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
        icon: { path: mdiPlus, type: 'mdi' as const },
      }),
      onClick: (e: MouseEvent) => onZoomIn(e as unknown as React.MouseEvent),
    }),
    [showZoom, trans, onZoomIn],
  );

  const zoomOutButton = useMemo(
    () => ({
      id: 'mapZoomOut',
      getState: () => ({
        visible: showZoom,
        title: trans('map.action.navigation-control-zoom-out'),
        icon: { path: mdiMinus, type: 'mdi' as const },
      }),
      onClick: (e: MouseEvent) => onZoomOut(e as unknown as React.MouseEvent),
    }),
    [showZoom, trans, onZoomOut],
  );

  const toolbarConfig = useMemo(
    () => ({
      kind: 'module' as const,
      moduleId: 'mapNavigationControl',
      moduleOrder: order,
      buttons: [compassButton, zoomInButton, zoomOutButton],
    }),
    [order, compassButton, zoomInButton, zoomOutButton],
  );

  const { control } = useToolbarControl(
    mapId,
    mergedProps,
    toolbarConfig,
  );

  const compassState = showCompass ? compassButton.getState() : null;
  const zoomInState = showZoom ? zoomInButton.getState() : null;
  const zoomOutState = showZoom ? zoomOutButton.getState() : null;

  return (
    <ModuleContainer
      {...moduleContainerProps}
      btn={
        <MapControlGroupButton>
          {compassState && (
            <MapCommonButton
              option={compassState}
              onClick={(e) => {
                e.stopPropagation();
                compassButton.onClick?.();
                control.sync();
              }}
            />
          )}
          {zoomInState && (
            <MapCommonButton
              option={zoomInState}
              onClick={(e) => {
                e.stopPropagation();
                zoomInButton.onClick?.(e.nativeEvent);
                control.sync();
              }}
            />
          )}
          {zoomOutState && (
            <MapCommonButton
              option={zoomOutState}
              onClick={(e) => {
                e.stopPropagation();
                zoomOutButton.onClick?.(e.nativeEvent);
                control.sync();
              }}
            />
          )}
        </MapControlGroupButton>
      }
    />
  );
}
