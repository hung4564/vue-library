import {
  applyMapStyleSettings,
  inputToSprite,
  readMapStyleSettings,
  spriteToInput,
  type WithMapPropType,
} from '@hungpvq/map-core';
import { mdiButtonState } from '@hungpvq/map-core/toolbar';
import { DraggableItemPopup } from '@hungpvq/react-draggable';
import { mdiCog } from '@mdi/js';
import { useEffect, useRef, useState } from 'react';

import { MapCommonButton } from '../../components/MapCommonButton';
import { MapControlButton } from '../../components/MapControlButton';
import { useLang } from '../../extra/lang/hook';
import { useRegisterMapControl } from '../../extra/registry/useRegisterMapControl';
import { useToolbarControl } from '../../extra/toolbar/helper';
import { InputText } from '../../field';
import { defaultMapProps, useMap } from '../../hooks/useMap';
import { useShow } from '../../hooks/useShow';
import { ModuleContainer } from '../ModuleContainer/ModuleContainer';

export interface SettingControlProps extends WithMapPropType {
  show?: boolean;
}

type SettingState = {
  zoom?: number;
  center: [number, number];
  sprite?: string;
  glyphs?: string;
};

export function SettingControl(props: SettingControlProps) {
  const mergedProps = { ...defaultMapProps, ...props };
  const { callMap, mapId, moduleContainerProps, order } = useMap({
    ...mergedProps,
    controlId: 'mapSettingControl',
  });
  const { trans } = useLang(mapId);
  const [show, toggleShow] = useShow(props.show);
  const [setting, setSetting] = useState<SettingState>({
    zoom: undefined,
    center: [0, 0],
    sprite: undefined,
    glyphs: undefined,
  });

  function loadCurrentView() {
    callMap((map) => {
      const next = readMapStyleSettings(map);
      setSetting({
        zoom: next.zoom,
        center: next.center,
        sprite: spriteToInput(next.sprite),
        glyphs: next.glyphs,
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

  const { panelBind } = useRegisterMapControl(mapId, {
    id: 'mapSettingControl',
    panelKind: 'popup',
    title: trans('map.setting-control.title'),
    buttonPosition: mergedProps.position,
    show,
    setShow: toggleShow,
    getProps: () => ({
      position: mergedProps.position,
      controlLayout: mergedProps.controlLayout,
    }),
    actions: [{ type: 'mapSettingControl', run: () => handleToggle() }],
  });

  function onSetSetting() {
    callMap((map) => {
      applyMapStyleSettings(map, {
        zoom: setting.zoom,
        center: setting.center,
        sprite: inputToSprite(setting.sprite),
        glyphs: setting.glyphs,
      });
    });
  }

  const { state, control } = useToolbarControl(mapId, mergedProps, {
    kind: 'single',
    id: 'mapSettingControl',
    getState: () =>
      mdiButtonState(mdiCog, {
        visible: true,
        active: show,
        title: trans('map.setting-control.title'),
        order,
      }),
    onClick: () => handleToggle(),
  });
  const controlRef = useRef(control);
  controlRef.current = control;

  useEffect(() => {
    controlRef.current.sync();
  }, [show]);

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
            title={trans('map.setting-control.title')}
            height={400}
            width={400}
            {...bind}
            {...panelBind}
          >
            <div className="map-setting-control">
              <div className="map-setting-control__fields">
                <div>
                  <label className="map-setting-control__center-label">
                    {trans('map.setting-control.field.center')}
                  </label>
                  <div className="map-setting-control__center">
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
                    label={trans('map.setting-control.field.zoom')}
                    value={setting.zoom != null ? String(setting.zoom) : ''}
                    onChange={(v) =>
                      setSetting((prev) => ({
                        ...prev,
                        zoom: v === '' ? undefined : Number(v),
                      }))
                    }
                  />
                </div>
                <div>
                  <InputText
                    label={trans('map.setting-control.field.sprite')}
                    value={setting.sprite ?? ''}
                    onChange={(v) =>
                      setSetting((prev) => ({ ...prev, sprite: v }))
                    }
                  />
                </div>
                <div>
                  <InputText
                    label={trans('map.setting-control.field.glyphs')}
                    value={setting.glyphs ?? ''}
                    onChange={(v) =>
                      setSetting((prev) => ({ ...prev, glyphs: v }))
                    }
                  />
                </div>
              </div>
              <MapControlButton
                className="map-setting-control__apply"
                onClick={onSetSetting}
                variant="filled"
              >
                {trans('map.setting-control.btn.apply')}
              </MapControlButton>
            </div>
          </DraggableItemPopup>
        ) : null
      }
    />
  );
}
