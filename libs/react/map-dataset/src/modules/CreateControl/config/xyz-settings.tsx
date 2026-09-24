import { InputText } from '@hungpvq/react-map-core/fields';

import type { CreateConfigFormProps } from './types';

/** XYZ layer settings — mirrors Vue `xyz-settings.vue`. */
export function ConfigRasterSettings({
  config,
  onChange,
  trans,
}: CreateConfigFormProps) {
  const bounds = (config.bounds as number[]) || [
    -180, -85.051129, 180, 85.051129,
  ];
  return (
    <div className="map-row create-control-settings">
      <div className="map-col-6">
        <InputText
          label={trans('map.layer-control.field.minzoom')}
          value={String(config.minzoom ?? 0)}
          onChange={(v) => onChange({ minzoom: Number(v) })}
        />
      </div>
      <div className="map-col-6">
        <InputText
          label={trans('map.layer-control.field.maxzoom')}
          value={String(config.maxzoom ?? 22)}
          onChange={(v) => onChange({ maxzoom: Number(v) })}
        />
      </div>
      {config.tileKind === 'vector' ? (
        <div className="map-col-12">
          <InputText
            label={trans('map.layer-control.field.source-layer')}
            value={String(config.sourceLayer ?? '')}
            onChange={(v) => onChange({ sourceLayer: v })}
          />
        </div>
      ) : null}
      {['minx', 'miny', 'maxx', 'maxy'].map((key, i) => (
        <div key={key} className="map-col-6">
          <InputText
            label={trans(`map.layer-control.field.bound.${key}`)}
            value={String(bounds[i] ?? '')}
            onChange={(v) => {
              const next = [...bounds];
              next[i] = Number(v);
              onChange({ bounds: next });
            }}
          />
        </div>
      ))}
    </div>
  );
}
