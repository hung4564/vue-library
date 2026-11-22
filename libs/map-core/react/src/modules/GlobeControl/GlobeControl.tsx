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

import { useLang } from '../../extra/lang/hook';
import { useMapControl } from '../../extra/registry/useMapControl';
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

  const { callMap, mapId, order } = useMap(mergedProps, onInit, onDestroy);
  const { trans } = useLang(mapId);

  function toggle() {
    callMap((map) => {
      setCurrentProjection(toggleGlobeProjection(map, currentProjection));
    });
  }

  const singleButton = {
    kind: 'single' as const,
    getState: () =>
      mdiButtonState(mdiWeb, {
        visible: true,
        active: isGlobeProjection(currentProjection),
        title: trans('map.global-control.title'),
        order,
      }),
    onClick: () => toggle(),
  };

  const { moduleContainerProps, control } = useMapControl(mapId, {
    id: 'mapGlobeControl',
    panelKind: 'button',
    from: mergedProps,
    order,
    actions: [
      {
        type: 'mapGlobeControl',
        run: () => {
          toggle();
        },
      },
    ],
    host: { button: singleButton },
    toolbar: singleButton,
  });

  useEffect(() => {
    control.sync();
  }, [currentProjection, control]);

  return <ModuleContainer {...moduleContainerProps} />;
}
