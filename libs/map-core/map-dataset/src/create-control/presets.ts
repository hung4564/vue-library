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

/** File basename without extension (e.g. `roads.geojson` → `roads`). */
export function layerNameFromFileName(fileName: string): string {
  const base = fileName.replace(/^.*[/\\]/, '').trim();
  if (!base) return '';
  const withoutExt = base.replace(/\.[^.]+$/, '');
  return (withoutExt || base).trim();
}

/** Last meaningful URL path segment without extension (skips `{z}/{x}/{y}`). */
export function layerNameFromUrl(url: string): string {
  const trimmed = url.trim();
  if (!trimmed) return '';
  try {
    const parsed = new URL(trimmed);
    const parts = parsed.pathname.split('/').filter(Boolean);
    for (let i = parts.length - 1; i >= 0; i--) {
      const seg = decodeURIComponent(parts[i]);
      if (/[{}]/.test(seg)) continue;
      const name = layerNameFromFileName(seg);
      if (name) return name;
    }
    return parsed.hostname || '';
  } catch {
    const pathOnly = trimmed.split(/[?#]/)[0] ?? trimmed;
    const parts = pathOnly.split('/').filter(Boolean);
    for (let i = parts.length - 1; i >= 0; i--) {
      const seg = parts[i];
      if (/[{}]/.test(seg)) continue;
      const name = layerNameFromFileName(seg);
      if (name) return name;
    }
    return layerNameFromFileName(pathOnly);
  }
}

/**
 * Prefer `nextName` when the current name is empty or still the default
 * suggested label for `layerKind`; otherwise keep the user's name.
 */
export function applyCreateControlLayerName(
  currentName: string | null | undefined,
  nextName: string,
  layerKind: CreateControlLayerKind = 'vector',
): string {
  const next = nextName.trim();
  const current = (currentName ?? '').trim();
  const suggested = suggestLayerName(layerKind);
  if (!next) return current || suggested;
  if (!current || current === suggested) return next;
  return current;
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
