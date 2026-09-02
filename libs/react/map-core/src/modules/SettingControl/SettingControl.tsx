import { SETTING_CONTROL_LOCALE, type WithMapPropType } from '@hungpvq/map-core';
import { DraggableItemPopup } from '@hungpvq/react-draggable';
import { mdiCog } from '@mdi/js';
import type { SpriteSpecification } from 'maplibre-gl';
import { useEffect, useState } from 'react';
import { MapCommonButton } from '../../components/MapCommonButton';
import { useLang } from '../../extra';
import { useToolbarControl } from '../../extra/toolbar';
import { BaseButton, InputText } from '../../field';
import { defaultMapProps, useMap, useShow } from '../../hooks';
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

function spriteToInput(sprite?: SpriteSpecification): string {
  if (sprite == null) return '';
  return typeof sprite === 'string' ? sprite : JSON.stringify(sprite);
}

function inputToSprite(value?: string): SpriteSpecification | undefined {
  if (!value?.trim()) return undefined;
  try {
    const parsed = JSON.parse(value);
    if (typeof parsed === 'object' && parsed !== null) {
      return parsed as SpriteSpecification;
    }
  } catch {
    // keep as url string
  }
  return value;
}

export function SettingControl(props: SettingControlProps) {
  const mergedProps = { ...defaultMapProps, ...props };
  const { callMap, mapId, moduleContainerProps, order } = useMap(mergedProps);
  const { trans, setLocaleDefault } = useLang(mapId);
  const [show, toggleShow] = useShow(props.show);
  const [setting, setSetting] = useState<SettingState>({
    zoom: undefined,
    center: [0, 0],
    sprite: undefined,
    glyphs: undefined,
  });

  useEffect(() => {
    setLocaleDefault(SETTING_CONTROL_LOCALE);
  }, [setLocaleDefault]);

  function loadCurrentView() {
    callMap((map) => {
      const style = map.getStyle();
      setSetting({
        zoom: map.getZoom(),
        center: [
          +map.getCenter().lng.toFixed(6),
          +map.getCenter().lat.toFixed(6),
        ],
        sprite: spriteToInput(style.sprite),
        glyphs: style.glyphs,
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
      if (setting.zoom) map.setZoom(setting.zoom);
      if (setting.center) map.setCenter(setting.center);
      const style = map.getStyle();
      const sprite = inputToSprite(setting.sprite);
      if (sprite) {
        style.sprite = sprite;
      }
      if (setting.glyphs) {
        style.glyphs = setting.glyphs;
      }
      map.setStyle(style);
    });
  }

  const { state, control } = useToolbarControl(mapId, mergedProps, {
    kind: 'single',
    id: 'mapSettingControl',
    getState: () => ({
      visible: true,
      title: trans('map.setting-control.title'),
      order,
      icon: { type: 'mdi' as const, path: mdiCog },
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
            title={trans('map.setting-control.title')}
            height={400}
            width={400}
            {...bind}
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
              <BaseButton
                className="map-setting-control__apply"
                onClick={onSetSetting}
              >
                {trans('map.setting-control.btn.apply')}
              </BaseButton>
            </div>
          </DraggableItemPopup>
        ) : null
      }
    />
  );
}
