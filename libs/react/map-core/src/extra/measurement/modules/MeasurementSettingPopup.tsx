import {
  type CoordinatesNumber,
  type DraftCoordinatesNumber,
  fitBounds,
  toCoordinatesNumberList,
  type WithMapPropType,
} from '@hungpvq/map-core';
import {
  getMeasurementAreaUnit,
  getMeasurementDistanceUnit,
  getMeasurementLabelPrefs,
  setMeasurementAreaUnit,
  setMeasurementDistanceUnit,
  setMeasurementLabelPrefs,
  type AreaUnit,
  type DistanceUnit,
  type IViewSettingField,
  type MeasurementLabelPrefs,
} from '@hungpvq/map-core/measurement';
import { DraggableItemPopup } from '@hungpvq/react-draggable';
import type { Feature, FeatureCollection, Geometry } from 'geojson';
import { useEffect, useMemo, useState } from 'react';
import { InputCheckbox, InputSelect } from '../../../field';
import { defaultMapProps, useMap } from '../../../hooks/useMap';
import { ModuleContainer } from '../../../modules/ModuleContainer/ModuleContainer';
import { useLang } from '../../lang/hook';
import { useRegisterMapControl } from '../../registry/useRegisterMapControl';
import { CrsDisplaySettings } from '../../crs/CrsDisplaySettings';
import { FieldGeometry } from './setting/field-geometry';
import { FieldPointCrs } from './setting/field-point-crs';
import { MeasurementSettingFields } from './setting/fields-show';

type Coord = DraftCoordinatesNumber;

export interface MeasurementSettingPopupProps extends WithMapPropType {
  show?: boolean;
  onUpdateShow?: (show: boolean) => void;
  value?: Coord[];
  onChange?: (value: CoordinatesNumber[]) => void;
  maxLength?: number;
  fields?: IViewSettingField[];
  measurementType?: string;
  onRefresh?: () => void;
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
  measurementType,
  onRefresh,
  popUpPosition = { top: 50, right: 40, width: 350, height: 300 },
  ...mapProps
}: MeasurementSettingPopupProps) {
  const merged = { ...defaultMapProps, ...mapProps };
  const { callMap, moduleContainerProps, mapId } = useMap({
    ...merged,
    controlId: 'mapMeasurementSetting',
  });
  const { trans } = useLang(mapId);
  const [distanceUnit, setDistanceUnit] = useState<DistanceUnit>(
    getMeasurementDistanceUnit(),
  );
  const [areaUnit, setAreaUnit] = useState<AreaUnit>(getMeasurementAreaUnit());
  const [labelPrefs, setLabelPrefs] = useState(getMeasurementLabelPrefs());
  const showDistanceUnit =
    measurementType === 'distance' ||
    measurementType === 'radius' ||
    measurementType === 'area';
  const showAreaUnit = measurementType === 'area';
  const showVertexLabelToggle = measurementType === 'distance';
  const showEdgeLabelToggle =
    measurementType === 'distance' ||
    measurementType === 'area' ||
    measurementType === 'radius';
  const showResultLabelToggle =
    measurementType === 'area' ||
    measurementType === 'angle' ||
    measurementType === 'point';
  const showSettingsSection =
    showDistanceUnit ||
    showAreaUnit ||
    showVertexLabelToggle ||
    showEdgeLabelToggle ||
    showResultLabelToggle;

  const distanceUnitItems = useMemo(
    () => [
      { value: 'auto', text: trans('map.measurement.unit.auto') },
      { value: 'm', text: trans('map.measurement.unit.meter') },
      { value: 'km', text: trans('map.measurement.unit.kilometer') },
      { value: 'ft', text: trans('map.measurement.unit.foot') },
      { value: 'mi', text: trans('map.measurement.unit.mile') },
    ],
    [trans],
  );

  const areaUnitItems = useMemo(
    () => [
      { value: 'auto', text: trans('map.measurement.unit.auto') },
      { value: 'm2', text: trans('map.measurement.unit.square-meter') },
      { value: 'km2', text: trans('map.measurement.unit.square-kilometer') },
      { value: 'ha', text: trans('map.measurement.unit.hecta') },
      { value: 'acre', text: trans('map.measurement.unit.acre') },
    ],
    [trans],
  );

  function onLabelToggle(key: keyof MeasurementLabelPrefs, checked: boolean) {
    setMeasurementLabelPrefs({ [key]: checked });
    setLabelPrefs(getMeasurementLabelPrefs());
    onRefresh?.();
  }

  const { panelBind } = useRegisterMapControl(mapId, {
    id: 'mapMeasurementSetting',
    panelKind: 'popup',
    title: trans('map.measurement.setting.title'),
    buttonPosition: merged.position,
    show,
    setShow: (v) => onUpdateShow?.(v),
    initialPanelPosition: {
      top: popUpPosition.top,
      right: popUpPosition.right,
    },
    getProps: () => ({
      position: merged.position,
      controlLayout: merged.controlLayout,
      measurementType,
    }),
    actions: [
      {
        type: 'mapMeasurementSetting',
        run: () => onUpdateShow?.(!show),
      },
    ],
  });

  function onFlyTo(geometry: Geometry | Feature | FeatureCollection) {
    callMap((map) => {
      fitBounds(map, geometry);
    });
  }

  function setValue(next: Coord[]) {
    onChange?.(toCoordinatesNumberList(next));
  }

  useEffect(() => {
    if (!show || typeof window === 'undefined') return;
    const clear = () => window.getSelection()?.removeAllRanges?.();
    clear();
    const id = requestAnimationFrame(clear);
    return () => cancelAnimationFrame(id);
  }, [show]);

  return (
    <ModuleContainer
      {...moduleContainerProps}
      draggable={(bind) =>
        show ? (
          <DraggableItemPopup
            {...bind}
            {...popUpPosition}
            {...panelBind}
            show={show}
            onUpdateShow={(v) => onUpdateShow?.(!!v)}
            title={trans('map.measurement.setting.title')}
            width={popUpPosition.width ?? 350}
            height={popUpPosition.height ?? 300}
          >
            <div className="map-measurement-setting">
              {measurementType === 'point' ? (
                <FieldPointCrs fields={fields} onChange={() => onRefresh?.()} />
              ) : (
                <MeasurementSettingFields fields={fields} />
              )}

              {showSettingsSection ? (
                <div className="map-measurement-setting__prefs">
                  {showDistanceUnit ? (
                    <InputSelect
                      label={trans('map.measurement.field.unit-distance')}
                      items={distanceUnitItems}
                      value={distanceUnit}
                      onChange={(v) => {
                        const unit = String(v) as DistanceUnit;
                        setDistanceUnit(unit);
                        setMeasurementDistanceUnit(unit);
                        onRefresh?.();
                      }}
                    />
                  ) : null}
                  {showAreaUnit ? (
                    <InputSelect
                      label={trans('map.measurement.field.unit-area')}
                      items={areaUnitItems}
                      value={areaUnit}
                      onChange={(v) => {
                        const unit = String(v) as AreaUnit;
                        setAreaUnit(unit);
                        setMeasurementAreaUnit(unit);
                        onRefresh?.();
                      }}
                    />
                  ) : null}
                  {showVertexLabelToggle ||
                  showEdgeLabelToggle ||
                  showResultLabelToggle ? (
                    <div className="map-measurement-setting__toggles">
                      {showVertexLabelToggle ? (
                        <InputCheckbox
                          label={trans('map.measurement.field.label-vertex')}
                          checked={labelPrefs.showVertexLabels}
                          onChange={(v) =>
                            onLabelToggle('showVertexLabels', v)
                          }
                        />
                      ) : null}
                      {showEdgeLabelToggle ? (
                        <InputCheckbox
                          label={trans('map.measurement.field.label-edge')}
                          checked={labelPrefs.showEdgeLabels}
                          onChange={(v) => onLabelToggle('showEdgeLabels', v)}
                        />
                      ) : null}
                      {showResultLabelToggle ? (
                        <InputCheckbox
                          label={trans('map.measurement.field.label-result')}
                          checked={labelPrefs.showResultLabel}
                          onChange={(v) =>
                            onLabelToggle('showResultLabel', v)
                          }
                        />
                      ) : null}
                    </div>
                  ) : null}
                  {measurementType === 'point' ? (
                    <CrsDisplaySettings
                      compact
                      onChange={() => onRefresh?.()}
                    />
                  ) : null}
                </div>
              ) : null}

              <div className="map-measurement-setting__geometry">
                <FieldGeometry
                  value={value}
                  maxLength={maxLength}
                  onChange={setValue}
                  onClickFillBound={onFlyTo}
                  title=""
                  titleActionDownload={trans('map.measurement.action.download')}
                  titleActionFillBound={trans('map.measurement.action.fly-to')}
                  titleActionAddPoint={trans('map.measurement.action.add-point')}
                />
              </div>
            </div>
          </DraggableItemPopup>
        ) : null
      }
    />
  );
}
