import {
  type SourceLayerOptionRow,
  SourceLayerOptionsList,
} from './source-layer-options';
import type { CreateConfigFormProps } from './types';

/** FileGDB settings — source-layer checkboxes only (no zoom/bounds). */
export function ConfigFilegdbSettings({
  config,
  onChange,
  trans,
}: CreateConfigFormProps) {
  const options = Array.isArray(config.sourceLayerOptions)
    ? (config.sourceLayerOptions as SourceLayerOptionRow[])
    : [];

  return (
    <div className="map-row create-control-settings">
      <SourceLayerOptionsList
        options={options}
        trans={trans}
        emptyHintKey="map.layer-control.create.file-hint-filegdb"
        onChange={(next) =>
          onChange({
            sourceLayerOptions: next,
            sourceLayers: next.filter((o) => o.enabled).map((o) => o.id),
          })
        }
      />
    </div>
  );
}
