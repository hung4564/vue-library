import { InputText } from '@hungpvq/react-map-core/fields';
import {
  SourceLayerOptionsList,
  type SourceLayerOptionRow,
} from './source-layer-options';
import type { CreateConfigFormProps } from './types';

/** Archive (MBTiles/PMTiles/TileJSON) settings: zoom, bounds, source-layers. */
export function ConfigArchiveSettings({
  config,
  onChange,
  trans,
}: CreateConfigFormProps) {
  const bounds =
    (config.bounds as number[]) || [-180, -85.051129, 180, 85.051129];
  const options = Array.isArray(config.sourceLayerOptions)
    ? (config.sourceLayerOptions as SourceLayerOptionRow[])
    : [];

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

      {config.tileKind === 'vector' ? (
        <SourceLayerOptionsList
          options={options}
          trans={trans}
          onChange={(next) => onChange({ sourceLayerOptions: next })}
        />
      ) : null}
    </div>
  );
}
