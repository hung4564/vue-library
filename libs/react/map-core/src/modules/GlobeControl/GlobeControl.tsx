import type { MapSimple } from '@hungpvq/map-core';
import {
  attachGlobeProjectionListener,
  isGlobeProjection,
  toggleGlobeProjection,
  type WithMapPropType,
} from '@hungpvq/map-core';
import { mdiButtonState } from '@hungpvq/map-core/toolbar';
import { mdiWeb } from '@mdi/js';
import React, { useCallback, useEffect, useRef, useState } from 'react';

import { MapCommonButton } from '../../components/MapCommonButton';
import { useLang } from '../../extra/lang/hook';
import { useRegisterMapControl } from '../../extra/registry/useRegisterMapControl';
import { useToolbarControl } from '../../extra/toolbar/helper';
import { defaultMapProps, useMap } from '../../hooks/useMap';
import { ModuleContainer } from '../ModuleContainer/ModuleContainer';

export function GlobeControl(props: WithMapPropType) {
  const mergedProps = { ...defaultMapProps, ...props };
  const [currentProjection, setCurrentProjection] = useState<
    string | undefined
  >('mercator');
  const detachProjectionRef = useRef<(() => void) | null>(null);

  const onInit = useCallback((_map: MapSimple) => {
    detachProjectionRef.current = attachGlobeProjectionListener(
      _map,
      setCurrentProjection,
    );
  }, []);

  const onDestroy = useCallback((_map: MapSimple) => {
    detachProjectionRef.current?.();
    detachProjectionRef.current = null;
  }, []);

  const { callMap, mapId, moduleContainerProps, order } = useMap(
    { ...mergedProps, controlId: 'mapGlobeControl' },
    onInit,
    onDestroy,
  );
  const { trans } = useLang(mapId);

  function toggle() {
    callMap((map) => {
      setCurrentProjection(toggleGlobeProjection(map, currentProjection));
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

  const { state, control } = useToolbarControl(mapId, mergedProps, {
    kind: 'single',
    id: 'mapGlobeControl',
    getState: () =>
      mdiButtonState(mdiWeb, {
        visible: true,
        active: isGlobeProjection(currentProjection),
        title: trans('map.global-control.title'),
        order,
      }),
    onClick: () => toggle(),
  });

  useEffect(() => {
    control.sync();
  }, [currentProjection, control]);

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
