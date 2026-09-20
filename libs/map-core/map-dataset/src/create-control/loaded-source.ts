import type { GeoJSON } from 'geojson';
import { asFeatureCollection } from '../utils/feature-collection';

export type CreateControlDataSourceKind = 'paste' | 'file' | 'url';

export type CreateControlLoadedSource = {
  kind: CreateControlDataSourceKind;
  /** Primary label (file name, URL host/path, or “Pasted data”). */
  label: string;
  /** Optional secondary line (size, sample name, …). */
  detail?: string;
  bytes?: number;
  featureCount?: number;
  geometryTypes?: string[];
  format?: string;
};

export type CreateControlGeoSummary = {
  featureCount: number;
  geometryTypes: string[];
  rootType: string;
};

/** Summarize loaded GeoJSON for the CreateControl “loaded data” card. */
export function summarizeCreateControlGeojson(
  geojson: GeoJSON | null | undefined,
): CreateControlGeoSummary | null {
  if (!geojson) return null;
  const fc = asFeatureCollection(geojson);
  if (!fc) {
    return { featureCount: 0, geometryTypes: [], rootType: geojson.type };
  }
  const types = new Set<string>();
  for (const feature of fc.features) {
    const t = feature?.geometry?.type;
    if (t) types.add(t);
  }
  return {
    featureCount: fc.features.length,
    geometryTypes: [...types].sort(),
    rootType: geojson.type,
  };
}

export function buildCreateControlLoadedSource(options: {
  kind: CreateControlDataSourceKind;
  label: string;
  detail?: string;
  bytes?: number;
  format?: string;
  geojson?: GeoJSON | null;
  /** Override summary when `geojson` is a lightweight FileGDB placeholder. */
  featureCount?: number;
  geometryTypes?: string[];
}): CreateControlLoadedSource {
  const summary = summarizeCreateControlGeojson(options.geojson ?? null);
  return {
    kind: options.kind,
    label: options.label,
    detail: options.detail,
    bytes: options.bytes,
    format: options.format,
    featureCount: options.featureCount ?? summary?.featureCount,
    geometryTypes: options.geometryTypes ?? summary?.geometryTypes,
  };
}

export function shortenCreateControlUrl(url: string, max = 48): string {
  const trimmed = url.trim();
  if (trimmed.length <= max) return trimmed;
  try {
    const parsed = new URL(trimmed);
    const path = `${parsed.pathname}${parsed.search}`.replace(/\/$/, '') || '/';
    const hostPath = `${parsed.host}${path}`;
    if (hostPath.length <= max) return hostPath;
    return `${hostPath.slice(0, max - 1)}…`;
  } catch {
    return `${trimmed.slice(0, max - 1)}…`;
  }
}

export type CreateControlArchiveMetaInput = {
  tileKind?: string | null;
  format?: string | null;
  archiveKind?: string | null;
  name?: string | null;
  minzoom?: number | null;
  maxzoom?: number | null;
  bounds?: number[] | null;
  sourceLayers?: string[] | null;
};

/**
 * Chips for the CreateControl archive metadata card (MBTiles / PMTiles).
 * Pass already-translated tile-kind / field labels.
 */
export function buildCreateControlArchiveMetaChips(
  meta: CreateControlArchiveMetaInput | null | undefined,
  labels: {
    tileKindVector: string;
    tileKindRaster: string;
    format: string;
    zoom: string;
    layers: string;
    bounds: string;
  },
): string[] {
  if (!meta) return [];
  const chips: string[] = [];
  if (meta.tileKind === 'raster') {
    chips.push(labels.tileKindRaster);
  } else if (meta.tileKind === 'vector') {
    chips.push(labels.tileKindVector);
  }
  if (meta.format?.trim()) {
    chips.push(`${labels.format}: ${meta.format.trim()}`);
  }
  if (meta.archiveKind?.trim()) {
    chips.push(meta.archiveKind.trim().toUpperCase());
  }
  if (meta.minzoom != null || meta.maxzoom != null) {
    chips.push(
      `${labels.zoom}: ${meta.minzoom ?? '?'}–${meta.maxzoom ?? '?'}`,
    );
  }
  const layerCount = meta.sourceLayers?.length ?? 0;
  if (meta.tileKind === 'vector') {
    chips.push(`${labels.layers}: ${layerCount}`);
  }
  if (meta.bounds && meta.bounds.length >= 4) {
    const [w, s, e, n] = meta.bounds;
    chips.push(
      `${labels.bounds}: ${fmtBound(w)}, ${fmtBound(s)} → ${fmtBound(e)}, ${fmtBound(n)}`,
    );
  }
  return chips;
}

function fmtBound(n: number): string {
  return Number.isFinite(n) ? n.toFixed(2) : String(n);
}
