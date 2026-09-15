import React, { useEffect, useState } from 'react';
import {
  MAP_ACTION_LOCALE,
  isDocumentFullscreen,
  resolveMapFullscreenTarget,
  subscribeFullscreenChange,
  toggleElementFullscreen,
  type WithMapPropType,
} from '@hungpvq/map-core';
import { mdiFullscreen, mdiFullscreenExit } from '@mdi/js';
import { mdiButtonState } from '@hungpvq/map-core/toolbar';
import { MapCommonButton } from '../../components/MapCommonButton';
import { useLang } from '../../extra/lang/hook';
import { useRegisterMapControl } from '../../extra/registry/useRegisterMapControl';
import { useToolbarControl } from '../../extra/toolbar/helper';
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
  const { mapId, callMap, moduleContainerProps, order } = useMap({
    ...mergedProps,
    controlId: 'mapFullscreenControl',
  });
  const { trans, setLocaleDefault } = useLang(mapId);

  useEffect(() => {
    setLocaleDefault(MAP_ACTION_LOCALE);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  useRegisterMapControl(mapId, {
    id: 'mapFullscreenControl',
    panelKind: 'button',
    buttonPosition: mergedProps.position,
    getProps: () => ({
      position: mergedProps.position,
      controlLayout: mergedProps.controlLayout,
    }),
    actions: [
      {
        type: 'mapFullscreenControl',
        run: () => {
          void toggleFullscreen();
        },
      },
    ],
  });

  const { state, control } = useToolbarControl(mapId, mergedProps, {
    kind: 'single',
    id: 'mapFullscreenControl',
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
  });

  useEffect(() => {
    control.sync();
  }, [isFullscreen, control]);

  return (
    <ModuleContainer
      {...moduleContainerProps}
      btn={
        state ? (
          <MapCommonButton
            option={state}
            onClick={(e) => {
              e.stopPropagation();
              void control.onAction(e);
            }}
          />
        ) : null
      }
    />
  );
}
