import { buildSourceLayerOptionMetaChips } from '@hungpvq/map-dataset/create-control';
import { MapControlButton } from '@hungpvq/react-map-core';
import { InputCheckbox } from '@hungpvq/react-map-core/fields';

import type { CreateConfigFormProps } from './types';

export type SourceLayerOptionRow = {
  id: string;
  enabled: boolean;
  color?: string;
  fields?: Record<string, string>;
  geometryTypes?: string[];
  description?: string;
  featureCount?: number;
};

type SourceLayerOptionsListProps = {
  options: SourceLayerOptionRow[];
  trans: CreateConfigFormProps['trans'];
  onChange: (next: SourceLayerOptionRow[]) => void;
  /** When set and `options` is empty, show this status instead of hiding the block. */
  emptyHintKey?: string;
};

/** Shared source-layer checkbox list (MBTiles / PMTiles / FileGDB). */
export function SourceLayerOptionsList({
  options,
  trans,
  onChange,
  emptyHintKey,
}: SourceLayerOptionsListProps) {
  if (!options.length) {
    if (!emptyHintKey) return null;
    return (
      <p className="map-col-12 create-control-status">{trans(emptyHintKey)}</p>
    );
  }

  function setAll(enabled: boolean) {
    onChange(options.map((o) => ({ ...o, enabled })));
  }

  return (
    <div className="map-col-12">
      <div className="create-control-section-label">
        {trans('map.layer-control.field.source-layers')}
      </div>
      <p className="create-control-status">
        {trans('map.layer-control.create.source-layers-hint')}
      </p>
      <div
        className="create-control-actions"
        style={{ gap: 8, marginBottom: 8 }}
      >
        <MapControlButton
          type="button"
          variant="outlined"
          onClick={() => setAll(true)}
        >
          {trans('map.layer-control.create.source-layers-all')}
        </MapControlButton>
        <MapControlButton
          type="button"
          variant="outlined"
          onClick={() => setAll(false)}
        >
          {trans('map.layer-control.create.source-layers-none')}
        </MapControlButton>
      </div>
      {options.map((opt, index) => {
        const chips = buildSourceLayerOptionMetaChips(opt, {
          featuresCount: trans('map.layer-control.create.features-count'),
          geometry: trans('map.layer-control.create.source-layer-geometry'),
          fields: trans('map.layer-control.create.source-layer-fields'),
        });
        return (
          <div
            key={opt.id}
            className="create-control-source-layer"
            style={{ marginBottom: 10 }}
          >
            <InputCheckbox
              label={opt.id}
              checked={!!opt.enabled}
              onChange={(enabled) => {
                onChange(
                  options.map((o, i) =>
                    i === index ? { ...o, enabled: !!enabled } : o,
                  ),
                );
              }}
            />
            {opt.description ? (
              <p className="create-control-status">{opt.description}</p>
            ) : null}
            {chips.length ? (
              <ul
                className="create-control-loaded__meta"
                style={{ margin: '4px 0 0 28px' }}
              >
                {chips.map((chip) => (
                  <li key={chip} className="create-control-loaded__chip">
                    {chip}
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
