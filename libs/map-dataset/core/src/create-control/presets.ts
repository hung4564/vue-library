import { RASTER_XYZ_SAMPLES } from '../raster/samples';
import type {
  CreateControlLayerKind,
  CreateControlSample,
} from '../vector-tile/samples';
import {
  TILEJSON_SAMPLES,
  VECTOR_SAMPLES,
  VECTOR_TILE_SAMPLES,
} from '../vector-tile/samples';

export type { CreateControlLayerKind, CreateControlSample };
export { RASTER_XYZ_SAMPLES } from '../raster/samples';
export {
  TILEJSON_SAMPLES,
  VECTOR_SAMPLES,
  VECTOR_TILE_SAMPLES,
} from '../vector-tile/samples';

export const SUGGESTED_LAYER_NAMES: Record<CreateControlLayerKind, string> = {
  geojson: 'GeoJSON layer',
  filegdb: 'FileGDB layer',
  xyz: 'XYZ layer',
  mbtiles: 'MBTiles layer',
  pmtiles: 'PMTiles layer',
  tilejson: 'TileJSON layer',
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

/**
 * Prefer `Something.gdb` folder / `Something.gdb.zip` / `Something_gdb.zip` basename.
 */
export function layerNameFromFileGdbFiles(
  files: Array<{ name?: string; webkitRelativePath?: string }>,
): string {
  for (const file of files) {
    const path = (file.webkitRelativePath || file.name || '')
      .replace(/\\/g, '/')
      .trim();
    if (!path) continue;
    const underscored = path.match(/(?:^|\/)([^/]+)_gdb\.zip$/i);
    if (underscored?.[1]) return underscored[1].trim();
    const match = path.match(/(?:^|\/)([^/]+)\.gdb(?:\/|\.zip$|$)/i);
    if (match?.[1]) return match[1].trim();
  }
  if (files.length === 1) {
    return layerNameFromFileName(files[0]?.name || '');
  }
  return '';
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
  layerKind: CreateControlLayerKind = 'geojson',
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
    case 'geojson':
      return VECTOR_SAMPLES;
    case 'xyz':
      return [...RASTER_XYZ_SAMPLES, ...VECTOR_TILE_SAMPLES];
    case 'tilejson':
      return TILEJSON_SAMPLES;
    case 'filegdb':
    case 'mbtiles':
    case 'pmtiles':
      return [];
    default:
      return [];
  }
}

/** URL filled into the URL tab when a sample is selected. */
export function getCreateControlSampleUrl(sample: CreateControlSample): string {
  if (sample.dataUrl) return sample.dataUrl;
  const url = sample.config['url'];
  return typeof url === 'string' ? url : '';
}
