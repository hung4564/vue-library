import type { RasterSourceSpecification } from 'maplibre-gl';
import type { IMapboxSourceView } from '../../interfaces';
import type { DatasetStoreLike } from '../../services/dataset.service';
import { findAllComponentsByType } from '../../model/visitors';
import type { CreateControlLayerKind } from './presets';
import {
  detectGeojsonStyleType,
  parseGeojsonData,
  parseGeojsonText,
} from './geojson-parse';

export type SourceCopyOption = {
  id: string;
  datasetId: string;
  datasetName: string;
  sourceName: string;
  sourceType: string;
  layerKind: CreateControlLayerKind;
  config: Record<string, unknown>;
};

function extractFromSource(source: IMapboxSourceView): Omit<
  SourceCopyOption,
  'id' | 'datasetId' | 'datasetName'
> | null {
  try {
    const spec = source.getMapboxSource();
    const sourceName = source.getName?.() || source.id;

    if (spec.type === 'geojson') {
      const raw = source.getData?.() ?? spec.data;
      const geojson = parseGeojsonData(raw);
      if (!geojson) return null;
      return {
        sourceName,
        sourceType: spec.type,
        layerKind: 'vector',
        config: {
          geojson,
          type: detectGeojsonStyleType(geojson),
        },
      };
    }

    if (spec.type === 'raster') {
      const raster = spec as RasterSourceSpecification;
      const tiles = raster.tiles ?? [];
      const url = tiles[0] ?? '';
      if (!url) return null;
      return {
        sourceName,
        sourceType: spec.type,
        layerKind: 'rasterxyz',
        config: {
          url,
          tiles,
          bounds: raster.bounds ?? [-180, -85.051129, 180, 85.051129],
          minzoom: raster.minzoom ?? 0,
          maxzoom: raster.maxzoom ?? 22,
        },
      };
    }
  } catch {
    return null;
  }

  return null;
}

/** List map sources that can be copied into CreateControl form (data.source.copy). */
export function listSourceCopyOptions(
  store: DatasetStoreLike,
): SourceCopyOption[] {
  const options: SourceCopyOption[] = [];

  for (const datasetId of store.datasetIds.value) {
    const root = store.datasets[datasetId];
    if (!root) continue;

    const datasetName = root.getName?.() || datasetId;
    const sources = findAllComponentsByType<IMapboxSourceView>(root, 'source');

    for (const source of sources) {
      const extracted = extractFromSource(source);
      if (!extracted) continue;

      options.push({
        id: `${datasetId}:${source.id}`,
        datasetId,
        datasetName,
        ...extracted,
      });
    }
  }

  return options;
}

/** Sync parse — small payloads or fallback. */
export function parsePastedGeojson(text: string) {
  return parseGeojsonText(text);
}
