import {
  isDocumentFullscreen,
  resolveMapFullscreenTarget,
  subscribeFullscreenChange,
  toggleElementFullscreen,
  type WithMapPropType,
} from '@hungpvq/map-core';
import { mdiButtonState } from '@hungpvq/map-core/toolbar';
import { mdiFullscreen, mdiFullscreenExit } from '@mdi/js';
import React, { useEffect, useState } from 'react';

import { useLang } from '../../extra/lang/hook';
import { useMapControl } from '../../extra/registry/useMapControl';
import { defaultMapProps, useMap } from '../../hooks/useMap';
import { ModuleContainer } from '../ModuleContainer/ModuleContainer';

export interface FullScreenControlProps extends WithMapPropType {
  type?: string;
}

export function FullScreenControl(props: FullScreenControlProps) {
  const mergedProps = {
    ...defaultMapProps,
    ...props,
    type: props.type || 'body',
  };
  const [isFullscreen, setIsFullscreen] = useState(false);
  const { mapId, callMap, order } = useMap({
    ...mergedProps,
    controlId: 'mapFullscreenControl',
  });
  const { trans } = useLang(mapId);

  useEffect(() => {
    setIsFullscreen(isDocumentFullscreen());
    return subscribeFullscreenChange(() => {
      setIsFullscreen(isDocumentFullscreen());
    });
  }, []);

  function resolveTarget(): HTMLElement | null {
    if (mergedProps.type === 'body') {
      return document.body;
    }
    let el: HTMLElement | null = null;
    callMap((map) => {
      el = resolveMapFullscreenTarget(map.getContainer());
    });
    return el;
  }

  async function toggleFullscreen() {
    await toggleElementFullscreen(resolveTarget());
    setIsFullscreen(isDocumentFullscreen());
  }

  const singleButton = {
    kind: 'single' as const,
    getState: () =>
      mdiButtonState(isFullscreen ? mdiFullscreenExit : mdiFullscreen, {
        visible: true,
        active: isFullscreen,
        order,
        title: isFullscreen
          ? trans('map.action.fullscreen-control-exit')
          : trans('map.action.fullscreen-control-enter'),
      }),
    onClick: () => {
      void toggleFullscreen();
    },
  };

  const { moduleContainerProps, control } = useMapControl(mapId, {
    id: 'mapFullscreenControl',
    panelKind: 'button',
    from: mergedProps,
    order,
    actions: [
      {
        type: 'mapFullscreenControl',
        run: () => {
          void toggleFullscreen();
        },
      },
    ],
    host: { button: singleButton },
    toolbar: singleButton,
  });

  useEffect(() => {
    control.sync();
  }, [isFullscreen, control]);

  return <ModuleContainer {...moduleContainerProps} />;
}
