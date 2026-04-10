import React, { useState, useCallback, useEffect } from 'react';
import type { MapSimple } from '@hungpvq/map-core';
import type { WithMapPropType } from '@hungpvq/map-core';
import { mdiWeb } from '@mdi/js';
import { MapCommonButton } from '../../components/MapCommonButton';
import { useLang } from '../../extra';
import { defaultMapProps, useMap } from '../../hooks';
import { ModuleContainer } from '../ModuleContainer/ModuleContainer';
import type { MapControlButtonUIState } from '@hungpvq/map-core';

export function GlobeControl(props: WithMapPropType) {
  const mergedProps = { ...defaultMapProps, ...props };
  const [currentProjection, setCurrentProjection] = useState<
    string | undefined
  >('mercator');

  const onInit = useCallback((_map: MapSimple) => {
    const handleMap = () => {
      setCurrentProjection(_map.getProjection()?.type as any);
    };
    _map.on('styledata', handleMap);
    return () => {
      _map.off('styledata', handleMap);
    };
  }, []);

  const onDestroy = useCallback((_map: MapSimple) => {
    // Cleanup handled in onInit return
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
        'global-control': {
          title: 'Toggle projection',
        },
      },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function toggle() {
    callMap((map) => {
      if (currentProjection === 'mercator' || !currentProjection) {
        map.setProjection({ type: 'globe' });
      } else {
        map.setProjection({ type: 'mercator' });
      }
      setCurrentProjection(map.getProjection()?.type as any);
    });
  }

  const buttonState: MapControlButtonUIState = {
    visible: true,
    active: currentProjection === 'globe',
    title: trans('map.global-control.title'),
    order: order,
    icon: {
      type: 'mdi',
      path: mdiWeb,
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
            toggle();
          }}
        />
      }
    />
  );
}
