import { isCreateControlCrsMismatch } from '@hungpvq/map-dataset/create-control';
import { GEOJSON_STYLE_AUTO } from '@hungpvq/map-dataset/geojson';
import { InputCrs, InputSelect } from '@hungpvq/react-map-core/fields';
import { useMemo } from 'react';
import type { CreateConfigFormProps } from './types';

/** GeoJSON layer settings — mirrors Vue `geojson-settings.vue`. */
export function GeojsonSettings({ config, onChange, trans }: CreateConfigFormProps) {
  const styleItems = useMemo(
    () => [
      { value: GEOJSON_STYLE_AUTO, text: trans('map.layer-control.field.style-type-auto') },
      { value: 'point', text: 'point' },
      { value: 'line', text: 'line' },
      { value: 'area', text: 'area' },
    ],
    [trans],
  );
  return (
    <div className="map-row create-control-settings">
      <div className="map-col-6">
        <InputSelect
          label={trans('map.layer-control.field.style-type')}
          value={String(config.type ?? 'point')}
          items={styleItems}
          onChange={(v) => onChange({ type: v })}
        />
      </div>
      <div className="map-col-6">
        <div className="form-group">
          <label>{trans('map.layer-control.field.color')}</label>
          <div className="input-container create-control-color">
            <input
              type="color"
              value={String(config.color ?? '#3498db')}
              onChange={(event) => onChange({ color: event.target.value })}
            />
          </div>
        </div>
      </div>
      <div className="map-col-12">
        <InputCrs
          label={trans('map.layer-control.field.crs')}
          placeholder={trans('map.layer-control.field.crs-placeholder')}
          value={String(config.crs ?? '4326')}
          onChange={(v) => onChange({ crs: v })}
        />
        {isCreateControlCrsMismatch(
          String(config.crs ?? ''),
          typeof config.detectedCrs === 'string' ? config.detectedCrs : null,
        ) ? (
          <div className="create-control-crs-mismatch" role="status">
            {trans('map.layer-control.create.crs-mismatch')}
          </div>
        ) : null}
      </div>
    </div>
  );
}
