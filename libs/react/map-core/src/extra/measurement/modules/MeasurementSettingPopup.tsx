import {
  fitBounds,
  type CoordinatesNumber,
  type IViewSettingField,
  type WithMapPropType,
} from '@hungpvq/map-core';
import { DraggableItemPopup } from '@hungpvq/react-draggable';
import type { Feature, FeatureCollection, Geometry } from 'geojson';
import { defaultMapProps, useMap } from '../../../hooks';
import { ModuleContainer } from '../../../modules';
import { useLang } from '../../lang';
import { FieldGeometry } from './setting/field-geometry';
import { MeasurementSettingFields } from './setting/fields-show';

type Coord = CoordinatesNumber | [null, null];

export interface MeasurementSettingPopupProps extends WithMapPropType {
  show?: boolean;
  onUpdateShow?: (show: boolean) => void;
  value?: Coord[];
  onChange?: (value: CoordinatesNumber[]) => void;
  maxLength?: number;
  fields?: IViewSettingField[];
  popUpPosition?: {
    top?: number;
    right?: number;
    width?: number;
    height?: number;
  };
}

export function MeasurementSettingPopup({
  show = false,
  onUpdateShow,
  value = [],
  onChange,
  maxLength = 0,
  fields = [{ text: 'Status', value: 'waiting...' }],
  popUpPosition = { top: 50, right: 40, width: 350, height: 300 },
  ...mapProps
}: MeasurementSettingPopupProps) {
  const merged = { ...defaultMapProps, ...mapProps };
  const { callMap, moduleContainerProps, mapId } = useMap(merged);
  const { trans } = useLang(mapId);

  function onFlyTo(geometry: Geometry | Feature | FeatureCollection) {
    callMap((map) => {
      fitBounds(map, geometry);
    });
  }

  function setValue(next: Coord[]) {
    const coords = next.filter(
      (c): c is CoordinatesNumber => c[0] !== null && c[1] !== null,
    );
    onChange?.(coords);
  }

  return (
    <ModuleContainer
      {...moduleContainerProps}
      draggable={(bind) =>
        show ? (
          <DraggableItemPopup
            {...bind}
            {...popUpPosition}
            show={show}
            onUpdateShow={(v) => onUpdateShow?.(!!v)}
            title={trans('map.measurement.setting.title')}
            width={popUpPosition.width ?? 350}
            height={popUpPosition.height ?? 300}
          >
            <div className="map-measurement-setting">
              <MeasurementSettingFields fields={fields} />
              <FieldGeometry
                value={value}
                maxLength={maxLength}
                onChange={setValue}
                onClickFillBound={onFlyTo}
                title={trans('map.measurement.setting.field.data')}
                titleActionDownload={trans('map.measurement.action.download')}
                titleActionFillBound={trans('map.measurement.action.fly-to')}
                titleActionAddPoint={trans('map.measurement.action.add-point')}
              />
            </div>
          </DraggableItemPopup>
        ) : null
      }
    />
  );
}
