import React, { useState, useCallback, useEffect } from 'react';
import type { WithMapPropType } from '@hungpvq/map-core';
import { mdiCog } from '@mdi/js';
import { MapCommonButton } from '../../components/MapCommonButton';
import { useLang } from '../../extra';
import { defaultMapProps, useMap, useShow } from '../../hooks';
import { ModuleContainer } from '../ModuleContainer/ModuleContainer';
import type { MapControlButtonUIState } from '@hungpvq/map-core';

export interface SettingControlProps extends WithMapPropType {
  show?: boolean;
}

export function SettingControl(props: SettingControlProps) {
  const mergedProps = { ...defaultMapProps, ...props };
  const [show, toggleShow] = useShow(props.show);
  const { callMap, mapId, moduleContainerProps, order } = useMap(mergedProps);
  const { trans, setLocaleDefault } = useLang(mapId);

  useEffect(() => {
    setLocaleDefault({
      map: {
        'setting-control': {
          title: 'Setting',
          field: {
            zoom: 'Zoom',
            center: 'Center',
            sprite: 'Sprite url',
            glyphs: 'Glyphs url',
          },
          btn: {
            apply: 'Apply',
          },
        },
      },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function onToggleShow() {
    toggleShow();
  }

  const buttonState: MapControlButtonUIState = {
    visible: true,
    title: trans('map.setting-control.title'),
    order: order,
    icon: {
      type: 'mdi',
      path: mdiCog,
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
            onToggleShow();
          }}
        />
      }
    >
      {/* Draggable popup would go here - placeholder for now */}
    </ModuleContainer>
  );
}
