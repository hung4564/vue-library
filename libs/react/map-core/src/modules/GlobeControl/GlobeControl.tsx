import React, { useState, useCallback, useEffect } from 'react';
import type { MapSimple } from '@hungpvq/map-core';
import { GLOBE_CONTROL_LOCALE, type WithMapPropType } from '@hungpvq/map-core';
import { mdiWeb } from '@mdi/js';
import { MapCommonButton } from '../../components/MapCommonButton';
import { useLang, useRegisterMapControl } from '../../extra';
import { defaultMapProps, useMap } from '../../hooks';
import { ModuleContainer } from '../ModuleContainer/ModuleContainer';
import type { MapControlButtonUIState } from '@hungpvq/map-core';

function getProjectionType(map: MapSimple): string | undefined {
  const type = map.getProjection()?.type;
  return typeof type === 'string' ? type : undefined;
}

export function GlobeControl(props: WithMapPropType) {
  const mergedProps = { ...defaultMapProps, ...props };
  const [currentProjection, setCurrentProjection] = useState<
    string | undefined
  >('mercator');

  const onInit = useCallback((_map: MapSimple) => {
    const handleMap = () => {
      setCurrentProjection(getProjectionType(_map));
    };
    _map.on('styledata', handleMap);
    return () => {
      _map.off('styledata', handleMap);
    };
  }, []);

  const { callMap, mapId, moduleContainerProps, order } = useMap(
    { ...mergedProps, controlId: 'mapGlobeControl' },
    onInit,
  );
  const { trans, setLocaleDefault } = useLang(mapId);

  useEffect(() => {
    setLocaleDefault(GLOBE_CONTROL_LOCALE);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function toggle() {
    callMap((map) => {
      if (currentProjection === 'mercator' || !currentProjection) {
        map.setProjection({ type: 'globe' });
      } else {
        map.setProjection({ type: 'mercator' });
      }
      setCurrentProjection(getProjectionType(map));
    });
  }

  useRegisterMapControl(mapId, {
    id: 'mapGlobeControl',
    panelKind: 'button',
    buttonPosition: mergedProps.position,
    getProps: () => ({
      position: mergedProps.position,
      controlLayout: mergedProps.controlLayout,
    }),
    actions: [
      {
        type: 'mapGlobeControl',
        run: () => {
          toggle();
        },
      },
    ],
  });

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
