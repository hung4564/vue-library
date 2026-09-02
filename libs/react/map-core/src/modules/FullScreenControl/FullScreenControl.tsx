import React, { useState, useEffect } from 'react';
import { MAP_ACTION_LOCALE, type WithMapPropType } from '@hungpvq/map-core';
import { mdiFullscreen, mdiFullscreenExit } from '@mdi/js';
import { MapCommonButton } from '../../components/MapCommonButton';
import { useLang } from '../../extra';
import { defaultMapProps, useMap } from '../../hooks';
import { ModuleContainer } from '../ModuleContainer/ModuleContainer';
import type { MapControlButtonUIState } from '@hungpvq/map-core';

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
  const { mapId, moduleContainerProps, order } = useMap(mergedProps);
  const { trans, setLocaleDefault } = useLang(mapId);

  useEffect(() => {
    setLocaleDefault(MAP_ACTION_LOCALE);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  async function toggleFullscreen() {
    if (!document.fullscreenElement) {
      const element =
        mergedProps.type === 'body'
          ? document.body
          : document.querySelector('.map-container');
      if (element) {
        await element.requestFullscreen();
      }
    } else {
      await document.exitFullscreen();
    }
  }

  const buttonState: MapControlButtonUIState = {
    visible: true,
    active: isFullscreen,
    order: order,
    title: isFullscreen
      ? trans('map.action.fullscreen-control-exit')
      : trans('map.action.fullscreen-control-enter'),
    icon: {
      type: 'mdi',
      path: isFullscreen ? mdiFullscreenExit : mdiFullscreen,
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
            toggleFullscreen();
          }}
        />
      }
    />
  );
}
