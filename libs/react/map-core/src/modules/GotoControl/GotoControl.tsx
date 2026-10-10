import {
  applyGotoSetting,
  type GotoSetting,
  gotoSettingFromCoordinateText,
  readGotoSetting,
  type WithMapPropType,
} from '@hungpvq/map-core';
import { mdiButtonState } from '@hungpvq/map-core/toolbar';
import { DraggableItemPopup } from '@hungpvq/react-draggable';
import { mdiMapMarkerOutline } from '@mdi/js';
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

export interface GotoControlProps extends WithMapPropType {
  show?: boolean;
}

export function GotoControl(props: GotoControlProps) {
  const mergedProps = { ...defaultMapProps, ...props };
  const { callMap, mapId, order } = useMap(mergedProps);
  const { trans } = useLang(mapId);
  const [show, toggleShow] = useShow(props.show);
  const [setting, setSetting] = useState<GotoSetting>({ center: [0, 0] });

  function loadCurrentView() {
    callMap((map) => {
      setSetting(readGotoSetting(map));
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
      applyGotoSetting(map, setting);
    });
  }

  async function onPasteCoordinates() {
    try {
      const text = await navigator.clipboard?.readText?.();
      const partial = gotoSettingFromCoordinateText(text || '');
      if (!partial) return;
      setSetting((prev) => ({ ...prev, ...partial }));
    } catch {
      // Clipboard permission denied — ignore.
    }
  }

  const singleButton = {
    kind: 'single' as const,
    getState: () =>
      mdiButtonState(mdiMapMarkerOutline, {
        visible: true,
        active: show,
        title: trans('map.goto-control.title'),
        order,
      }),
    onClick: () => handleToggle(),
  };

  const { moduleContainerProps, panelBind, control } = useMapControl(mapId, {
    id: 'mapGotoControl',
    panelKind: 'popup',
    title: trans('map.goto-control.title'),
    from: mergedProps,
    order,
    show,
    setShow: toggleShow,
    defaultPanelSize: { width: 400, height: 300 },
    actions: [{ type: 'mapGotoControl', run: () => handleToggle() }],
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
          title={trans('map.goto-control.title')}
          {...bind}
          {...panelBind}
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
            <div className="map-goto-control__actions">
              <MapControlButton
                onClick={() => void onPasteCoordinates()}
                variant="outlined"
              >
                {trans('map.goto-control.btn.paste')}
              </MapControlButton>
              <MapControlButton
                className="map-goto-control__btn"
                onClick={onSetSetting}
                variant="filled"
              >
                {trans('map.goto-control.btn.apply')}
              </MapControlButton>
            </div>
          </div>
        </DraggableItemPopup>
      ) : null,
    [
      onSetSetting,
      panelBind,
      setting.center,
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
