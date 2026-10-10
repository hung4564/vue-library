import {
  type CoordinatesNumber,
  type DraftCoordinatesNumber,
  fitBounds,
  toCoordinatesNumberList,
  type WithMapPropType,
} from '@hungpvq/map-core';
import {
  type AreaUnit,
  type DistanceUnit,
  getMeasurementAreaUnit,
  getMeasurementDistanceUnit,
  getMeasurementLabelPrefs,
  getMeasurementSettingUiFlags,
  type IViewSettingField,
  type MeasurementLabelPrefs,
  setMeasurementAreaUnit,
  setMeasurementDistanceUnit,
  setMeasurementLabelPrefs,
} from '@hungpvq/map-core/measurement';
import { DraggableItemPopup } from '@hungpvq/react-draggable';
import type { Feature, FeatureCollection, Geometry } from 'geojson';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { InputCheckbox, InputSelect } from '../../../field';
import { defaultMapProps, useMap } from '../../../hooks/useMap';
import {
  ModuleContainer,
  ModuleContainerProps,
} from '../../../modules/ModuleContainer/ModuleContainer';
import { CrsDisplaySettings } from '../../crs/CrsDisplaySettings';
import { useLang } from '../../lang/hook';
import { useMapControl } from '../../registry/useMapControl';
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
  ...mapProps
}: MeasurementSettingPopupProps) {
  const merged = { ...defaultMapProps, ...mapProps };
  const { callMap, mapId } = useMap({
    ...merged,
    controlId: 'mapMeasurementSetting',
  });
  const { trans } = useLang(mapId);
  const [distanceUnit, setDistanceUnit] = useState<DistanceUnit>(
    getMeasurementDistanceUnit(),
  );
  const [areaUnit, setAreaUnit] = useState<AreaUnit>(getMeasurementAreaUnit());
  const [labelPrefs, setLabelPrefs] = useState(getMeasurementLabelPrefs());
  const {
    showDistanceUnit,
    showAreaUnit,
    showVertexLabelToggle,
    showEdgeLabelToggle,
    showResultLabelToggle,
  } = getMeasurementSettingUiFlags(measurementType);
  const showSettingsSection =
    showDistanceUnit ||
    showAreaUnit ||
    showVertexLabelToggle ||
    showEdgeLabelToggle ||
    showResultLabelToggle ||
    measurementType === 'point';

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

  const onLabelToggle = useCallback(
    (key: keyof MeasurementLabelPrefs, checked: boolean) => {
      setMeasurementLabelPrefs({ [key]: checked });
      setLabelPrefs(getMeasurementLabelPrefs());
      onRefresh?.();
    },
    [onRefresh],
  );

  const { panelBind, moduleContainerProps } = useMapControl(mapId, {
    id: 'mapMeasurementSetting',
    panelKind: 'popup',
    title: trans('map.measurement.setting.title'),
    from: merged,
    show,
    setShow: (v) => onUpdateShow?.(v),
    defaultPanelSize: { width: 350, height: 300 },
    actions: [
      {
        type: 'mapMeasurementSetting',
        run: () => onUpdateShow?.(!show),
      },
    ],
  });

  const onFlyTo = useCallback(
    (geometry: Geometry | Feature | FeatureCollection) => {
      callMap((map) => {
        fitBounds(map, geometry);
      });
    },
    [callMap],
  );

  const setValue = useCallback(
    (next: Coord[]) => {
      onChange?.(toCoordinatesNumberList(next));
    },
    [onChange],
  );

  useEffect(() => {
    if (!show || typeof window === 'undefined') return;
    const clear = () => window.getSelection()?.removeAllRanges?.();
    clear();
    const id = requestAnimationFrame(clear);
    return () => cancelAnimationFrame(id);
  }, [show]);

  const renderDraggable = useCallback<
    NonNullable<ModuleContainerProps['draggable']>
  >(
    (bind) =>
      show ? (
        <DraggableItemPopup
          {...bind}
          {...panelBind}
          show={show}
          onUpdateShow={(v) => onUpdateShow?.(!!v)}
          title={trans('map.measurement.setting.title')}
        >
          <div className="map-measurement-setting">
            {measurementType === 'point' ? (
              <FieldPointCrs
                fields={fields}
                onChange={() => onRefresh?.()}
              />
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
                        onChange={(v) => onLabelToggle('showVertexLabels', v)}
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
                        onChange={(v) => onLabelToggle('showResultLabel', v)}
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
      ) : null,
    [
      areaUnit,
      areaUnitItems,
      distanceUnit,
      distanceUnitItems,
      fields,
      labelPrefs.showEdgeLabels,
      labelPrefs.showResultLabel,
      labelPrefs.showVertexLabels,
      maxLength,
      measurementType,
      onFlyTo,
      onLabelToggle,
      onRefresh,
      onUpdateShow,
      panelBind,
      setValue,
      show,
      showAreaUnit,
      showDistanceUnit,
      showEdgeLabelToggle,
      showResultLabelToggle,
      showSettingsSection,
      showVertexLabelToggle,
      trans,
      value,
    ],
  );
  return (
    <ModuleContainer
      {...moduleContainerProps}
      draggable={renderDraggable}
    />
  );
}
