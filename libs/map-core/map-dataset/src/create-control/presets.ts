import type { CreateControlLayerKind, CreateControlSample } from '../vector-tile/samples';
import { VECTOR_SAMPLES } from '../vector-tile/samples';
import { RASTER_XYZ_SAMPLES } from '../raster/samples';

export type { CreateControlLayerKind, CreateControlSample };
export { VECTOR_SAMPLES } from '../vector-tile/samples';
export { RASTER_XYZ_SAMPLES } from '../raster/samples';

export const SUGGESTED_LAYER_NAMES: Record<CreateControlLayerKind, string> = {
  vector: 'Vector layer',
  rasterxyz: 'Raster XYZ layer',
};

export function suggestLayerName(layerKind: CreateControlLayerKind): string {
  return SUGGESTED_LAYER_NAMES[layerKind];
}

export function getCreateControlSamples(
  layerKind: CreateControlLayerKind,
): CreateControlSample[] {
  switch (layerKind) {
    case 'vector':
      return VECTOR_SAMPLES;
    case 'rasterxyz':
      return RASTER_XYZ_SAMPLES;
    default:
      return [];
  }
}

/** URL filled into the URL tab when a sample is selected. */
export function getCreateControlSampleUrl(
  sample: CreateControlSample,
): string {
  if (sample.dataUrl) return sample.dataUrl;
  const url = sample.config['url'];
  return typeof url === 'string' ? url : '';
}
