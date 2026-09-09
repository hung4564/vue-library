import type { GeoJSON } from 'geojson';
import { asGisFeatureCollection } from './gis-parse';

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
  const fc = asGisFeatureCollection(geojson);
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
}): CreateControlLoadedSource {
  const summary = summarizeCreateControlGeojson(options.geojson ?? null);
  return {
    kind: options.kind,
    label: options.label,
    detail: options.detail,
    bytes: options.bytes,
    format: options.format,
    featureCount: summary?.featureCount,
    geometryTypes: summary?.geometryTypes,
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
