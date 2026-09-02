import { useEffect } from 'react';
import { SETTING_CONTROL_LOCALE, type WithMapPropType } from '@hungpvq/map-core';
import { DraggableItemPopup } from '@hungpvq/react-draggable';
import { mdiCog } from '@mdi/js';
import { Icon } from '@mdi/react';
import { MapControlButton } from '../../../components/MapControlButton';
import { InputCheckbox } from '../../../field';
import { defaultMapProps, useMap, useShow } from '../../../hooks';
import { ModuleContainer } from '../../../modules/ModuleContainer/ModuleContainer';
import { useLang } from '../../lang';
import { useMapCompareSetting } from '../hooks';

export interface CompareSettingControlProps extends WithMapPropType {
  show?: boolean;
}

export function CompareSettingControl(props: CompareSettingControlProps) {
  const merged = { ...defaultMapProps, ...props };
  const [show, toggleShow] = useShow(props.show);
  const { mapId, moduleContainerProps } = useMap(merged);
  const { trans, setLocaleDefault } = useLang(mapId);
  const { setting, updateSetting } = useMapCompareSetting(mapId);

  useEffect(() => {
    setLocaleDefault(SETTING_CONTROL_LOCALE);
  }, [setLocaleDefault]);

  return (
    <ModuleContainer
      {...moduleContainerProps}
      btn={
        <MapControlButton
          onClick={(e) => {
            e.stopPropagation();
            toggleShow();
          }}
          title={trans('map.setting-control.title')}
        >
          <Icon path={mdiCog} size={0.75} />
        </MapControlButton>
      }
      draggable={(bind) =>
        show ? (
          <DraggableItemPopup
            show={show}
            onUpdateShow={(v) => toggleShow(!!v)}
            title={trans('map.setting-control.title')}
            height={200}
            width={280}
            {...bind}
          >
            <div className="map-compare-setting">
              <div className="map-compare-setting__fields">
                <div>
                  <InputCheckbox
                    label={trans('map.setting-control.field.split')}
                    checked={!!setting.split}
                    onChange={(v) => updateSetting({ ...setting, split: v })}
                  />
                </div>
                <div>
                  <InputCheckbox
                    label={trans('map.setting-control.field.vertical')}
                    checked={!!setting.vertical}
                    onChange={(v) => updateSetting({ ...setting, vertical: v })}
                  />
                </div>
                <div>
                  <InputCheckbox
                    label={trans('map.setting-control.field.sync')}
                    checked={!!setting.sync}
                    onChange={(v) => updateSetting({ ...setting, sync: v })}
                  />
                </div>
              </div>
            </div>
          </DraggableItemPopup>
        ) : null
      }
    />
  );
}

export function CompareSettingCard(props: CompareSettingControlProps) {
  return <CompareSettingControl {...props} />;
}
