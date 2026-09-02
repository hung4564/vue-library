import { GOTO_CONTROL_LOCALE, type WithMapPropType } from '@hungpvq/map-core';
import { DraggableItemPopup } from '@hungpvq/react-draggable';
import { mdiMapMarkerOutline } from '@mdi/js';
import { useEffect, useState } from 'react';
import { MapCommonButton } from '../../components/MapCommonButton';
import { useLang } from '../../extra';
import { useToolbarControl } from '../../extra/toolbar';
import { BaseButton, InputText } from '../../field';
import { defaultMapProps, useMap, useShow } from '../../hooks';
import { ModuleContainer } from '../ModuleContainer/ModuleContainer';

export interface GotoControlProps extends WithMapPropType {
  show?: boolean;
}

export function GotoControl(props: GotoControlProps) {
  const mergedProps = { ...defaultMapProps, ...props };
  const { callMap, mapId, moduleContainerProps, order } = useMap(mergedProps);
  const { trans, setLocaleDefault } = useLang(mapId);
  const [show, toggleShow] = useShow(props.show);
  const [setting, setSetting] = useState<{
    zoom?: number;
    center: [number, number];
  }>({ center: [0, 0] });

  useEffect(() => {
    setLocaleDefault(GOTO_CONTROL_LOCALE);
  }, [setLocaleDefault]);

  function loadCurrentView() {
    callMap((map) => {
      setSetting({
        zoom: map.getZoom(),
        center: [
          +map.getCenter().lng.toFixed(6),
          +map.getCenter().lat.toFixed(6),
        ],
      });
    });
  }

  function handleToggle() {
    const nextShow = !show;
    toggleShow(nextShow);
    if (nextShow) {
      loadCurrentView();
    }
  }

  function onSetSetting() {
    callMap((map) => {
      if (setting.zoom != null) map.setZoom(setting.zoom);
      if (setting.center) map.setCenter(setting.center);
    });
  }

  const { state, control } = useToolbarControl(mapId, mergedProps, {
    kind: 'single',
    id: 'mapGotoControl',
    getState: () => ({
      visible: true,
      title: trans('map.goto-control.title'),
      order,
      icon: { type: 'mdi' as const, path: mdiMapMarkerOutline },
    }),
    onClick: () => handleToggle(),
  });

  return (
    <ModuleContainer
      {...moduleContainerProps}
      btn={
        state ? (
          <MapCommonButton
            option={state}
            onClick={(e) => {
              e.stopPropagation();
              control.onAction(e.nativeEvent);
            }}
          />
        ) : null
      }
      draggable={(bind) =>
        show ? (
          <DraggableItemPopup
            show={show}
            onUpdateShow={(v) => toggleShow(!!v)}
            title={trans('map.goto-control.title')}
            height={300}
            width={400}
            {...bind}
          >
            <div className="map-goto-control">
              <div className="map-goto-control__fields">
                <div>
                  <label className="map-goto-control__center-label">
                    {trans('map.goto-control.field.center')}
                  </label>
                  <div className="map-goto-control__center">
                    <InputText
                      type="number"
                      step="0.0000001"
                      value={String(setting.center[0])}
                      onChange={(v) =>
                        setSetting((prev) => ({
                          ...prev,
                          center: [Number(v), prev.center[1]],
                        }))
                      }
                    />
                    <InputText
                      type="number"
                      step="0.0000001"
                      value={String(setting.center[1])}
                      onChange={(v) =>
                        setSetting((prev) => ({
                          ...prev,
                          center: [prev.center[0], Number(v)],
                        }))
                      }
                    />
                  </div>
                </div>
                <div>
                  <InputText
                    label={trans('map.goto-control.field.zoom')}
                    type="number"
                    min={0}
                    max={24}
                    value={setting.zoom != null ? String(setting.zoom) : ''}
                    onChange={(v) =>
                      setSetting((prev) => ({
                        ...prev,
                        zoom: v === '' ? undefined : Number(v),
                      }))
                    }
                  />
                </div>
              </div>
              <BaseButton className="map-goto-control__btn" onClick={onSetSetting}>
                {trans('map.goto-control.btn.apply')}
              </BaseButton>
            </div>
          </DraggableItemPopup>
        ) : null
      }
    />
  );
}
