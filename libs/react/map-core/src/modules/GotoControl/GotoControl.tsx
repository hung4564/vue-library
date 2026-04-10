import React, { useState, useCallback, useEffect } from 'react';
import type { WithMapPropType } from '@hungpvq/map-core';
import { mdiMapMarkerOutline } from '@mdi/js';
import { MapCommonButton } from '../../components/MapCommonButton';
import { BaseButton, InputText } from '../../field';
import { useLang } from '../../extra';
import { defaultMapProps, useMap, useShow } from '../../hooks';
import { ModuleContainer } from '../ModuleContainer/ModuleContainer';
import type { MapControlButtonUIState } from '@hungpvq/map-core';

export interface GotoControlProps extends WithMapPropType {
  show?: boolean;
}

export function GotoControl(props: GotoControlProps) {
  const mergedProps = { ...defaultMapProps, ...props };
  const [show, toggleShow] = useShow(props.show);
  const [setting, setSetting] = useState<{
    zoom?: number;
    center: [number, number];
  }>({ center: [0, 0] });
  const { callMap, mapId, moduleContainerProps, order } = useMap(mergedProps);
  const { trans, setLocaleDefault } = useLang(mapId);

  useEffect(() => {
    setLocaleDefault({
      map: {
        'goto-control': {
          title: 'Go to',
          field: {
            zoom: 'Zoom',
            center: 'Center',
          },
          btn: {
            apply: 'Go to',
          },
        },
      },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function onToggleShow() {
    toggleShow();
    if (show) {
      callMap((_map) => {
        setSetting({
          zoom: _map.getZoom(),
          center: [
            +_map.getCenter().lng.toFixed(6),
            +_map.getCenter().lat.toFixed(6),
          ],
        });
      });
    }
  }

  const onSetSetting = () => {
    callMap((map) => {
      if (setting.zoom) map.setZoom(setting.zoom);
      if (setting.center) map.setCenter(setting.center);
    });
  };

  const buttonState: MapControlButtonUIState = {
    visible: true,
    title: trans('map.goto-control.title'),
    order: order,
    icon: {
      type: 'mdi',
      path: mdiMapMarkerOutline,
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
