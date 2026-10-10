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
import { useCallback, useEffect, useState } from 'react';

import { MapControlButton } from '../../components/MapControlButton';
import { useLang } from '../../extra/lang/hook';
import { useMapControl } from '../../extra/registry/useMapControl';
import { InputText } from '../../field';
import { defaultMapProps, useMap } from '../../hooks/useMap';
import { useShow } from '../../hooks/useShow';
import {
  ModuleContainer,
  ModuleContainerProps,
} from '../ModuleContainer/ModuleContainer';

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
  const { callMap, mapId, order } = useMap(mergedProps);
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

  const onSetSetting = useCallback(() => {
    callMap((map) => {
      applyMapStyleSettings(map, {
        zoom: setting.zoom,
        center: setting.center,
        sprite: inputToSprite(setting.sprite),
        glyphs: setting.glyphs,
      });
    });
  }, [callMap, setting.center, setting.glyphs, setting.sprite, setting.zoom]);

  const singleButton = {
    kind: 'single' as const,
    getState: () =>
      mdiButtonState(mdiCog, {
        visible: true,
        active: show,
        title: trans('map.setting-control.title'),
        order,
      }),
    onClick: () => handleToggle(),
  };

  const { moduleContainerProps, panelBind, control } = useMapControl(mapId, {
    id: 'mapSettingControl',
    panelKind: 'popup',
    title: trans('map.setting-control.title'),
    from: mergedProps,
    order,
    show,
    setShow: toggleShow,
    defaultPanelSize: { width: 400, height: 400 },
    actions: [{ type: 'mapSettingControl', run: () => handleToggle() }],
    host: { button: singleButton },
    toolbar: singleButton,
  });

  useEffect(() => {
    control.sync();
  }, [show, control]);
  const renderDraggable = useCallback<
    NonNullable<ModuleContainerProps['draggable']>
  >(
    (bind) =>
      show ? (
        <DraggableItemPopup
          show={show}
          onUpdateShow={(v) => toggleShow(!!v)}
          title={trans('map.setting-control.title')}
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
      ) : null,
    [
      onSetSetting,
      panelBind,
      setting.center,
      setting.glyphs,
      setting.sprite,
      setting.zoom,
      show,
      toggleShow,
      trans,
    ],
  );
  return (
    <ModuleContainer
      {...moduleContainerProps}
      draggable={renderDraggable}
    />
  );
}
