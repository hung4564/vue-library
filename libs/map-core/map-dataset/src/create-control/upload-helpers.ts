import { WorkerMonitor, workerProgressRatio } from '@hungpvq/map-core';
import type { GeoJSON } from 'geojson';
import { loadGisFileAsync, loadGisTextAsync, loadGisUrlAsync } from '../geojson/geojson-worker.client';
import { applyCreateControlSample } from './apply-sample';
import type { GisFormat } from './gis-format';
import { formatCreateControlBytes } from './limits';
import {
  buildCreateControlLoadedSource,
  shortenCreateControlUrl,
  type CreateControlDataSourceKind,
  type CreateControlLoadedSource,
} from './loaded-source';
import {
  applyCreateControlLayerName,
  getCreateControlSampleUrl,
  getCreateControlSamples,
  layerNameFromFileName,
  layerNameFromUrl,
  type CreateControlLayerKind,
  type CreateControlSample,
} from './presets';

/** Whether pasted text looks like a finished GIS document (avoid errors mid-type). */
export function looksCompleteGis(text: string): boolean {
  const trimmed = text.trim();
  if (!trimmed) return false;
  if (trimmed.startsWith('{') && trimmed.endsWith('}')) return true;
  if (trimmed.startsWith('[') && trimmed.endsWith(']')) return true;
  if (trimmed.startsWith('<') && /<\/[a-z]+>\s*$/i.test(trimmed)) return true;
  return /^(GEOMETRYCOLLECTION|MULTI(POINT|LINESTRING|POLYGON)|POINT|LINESTRING|POLYGON)\s*\([\s\S]*\)$/i.test(
    trimmed,
  );
}

/** Locale key for the loaded-source eyebrow by data kind. */
export function createControlLoadedSourceEyebrowKey(
  kind?: CreateControlDataSourceKind,
): string {
  if (kind === 'file') return 'map.layer-control.create.loaded-from-file';
  if (kind === 'url') return 'map.layer-control.create.loaded-from-url';
  return 'map.layer-control.create.loaded-from-paste';
}

/**
 * Build meta chips for the CreateControl loaded-data card.
 * Pass already-translated feature/geometry labels.
 */
export function buildCreateControlLoadedMetaChips(
  source: CreateControlLoadedSource | null | undefined,
  labels: { featuresCount: string; geometryTypes: string },
): string[] {
  if (!source) return [];
  const chips: string[] = [];
  if (typeof source.featureCount === 'number') {
    chips.push(`${labels.featuresCount}: ${source.featureCount}`);
  }
  if (source.geometryTypes?.length) {
    chips.push(`${labels.geometryTypes}: ${source.geometryTypes.join(', ')}`);
  }
  if (typeof source.bytes === 'number') {
    chips.push(formatCreateControlBytes(source.bytes));
  }
  return chips;
}

export type CreateControlUploadFileSummary = {
  label: string;
  totalBytes: number;
  fileName: string;
};

/** Label + size summary for one or more dropped GIS files. */
export function summarizeCreateControlUploadFiles(
  files: Array<{ name?: string; size?: number }>,
): CreateControlUploadFileSummary {
  const totalBytes = files.reduce((sum, file) => sum + (file?.size ?? 0), 0);
  const label =
    files.length === 1
      ? files[0]?.name || 'file'
      : `${files.length} files`;
  const fileName = files[0]?.name || label;
  return { label, totalBytes, fileName };
}

/** Status line while parsing (optional worker progress ratio 0–1). */
export function formatCreateControlParseStatus(
  parsingLabel: string,
  totalBytes: number,
  progressRatio?: number | null,
): string {
  const size = formatCreateControlBytes(totalBytes);
  if (progressRatio == null) {
    return `${parsingLabel} (${size})`;
  }
  const pct = Math.round(progressRatio * 100);
  return `${parsingLabel} ${pct}% (${size})`;
}

/**
 * Subscribe to geojson worker progress and push formatted status strings.
 * Returns an unsubscribe function.
 */
export function subscribeCreateControlParseProgress(
  parsingLabel: string,
  totalBytes: number,
  onStatus: (text: string) => void,
): () => void {
  return WorkerMonitor.subscribe(() => {
    const snap = WorkerMonitor.get('geojson');
    const task = snap?.pending?.[0];
    const ratio = workerProgressRatio(task?.progress);
    if (ratio == null) return;
    onStatus(formatCreateControlParseStatus(parsingLabel, totalBytes, ratio));
  });
}

export function findCreateControlSampleById(
  layerKind: CreateControlLayerKind,
  sampleId: string,
): CreateControlSample | undefined {
  if (!sampleId) return undefined;
  return getCreateControlSamples(layerKind).find((item) => item.id === sampleId);
}

/** URL to fill when a sample is selected; `null` if id is empty/unknown. */
export function resolveCreateControlSampleSelection(
  layerKind: CreateControlLayerKind,
  sampleId: string,
): string | null {
  const sample = findCreateControlSampleById(layerKind, sampleId);
  if (!sample) return null;
  return getCreateControlSampleUrl(sample);
}

/**
 * After the URL field changes, clear the sample id when it no longer matches.
 * Returns the next sample id (possibly `''`).
 */
export function resolveCreateControlSampleIdAfterUrlEdit(
  layerKind: CreateControlLayerKind,
  sampleId: string,
  url: string,
): string {
  const sample = findCreateControlSampleById(layerKind, sampleId);
  if (!sample) return sampleId;
  if (getCreateControlSampleUrl(sample) !== url.trim()) return '';
  return sampleId;
}

/** Sample whose configured URL matches both id and the current URL field. */
export function findCreateControlSampleMatchingUrl(
  layerKind: CreateControlLayerKind,
  sampleId: string,
  url: string,
): CreateControlSample | undefined {
  const sample = findCreateControlSampleById(layerKind, sampleId);
  if (!sample) return undefined;
  if (getCreateControlSampleUrl(sample) !== url.trim()) return undefined;
  return sample;
}

export type CreateControlFileParseResult = {
  geojson: GeoJSON;
  crs: string | null;
  format?: GisFormat;
  loadedSource: CreateControlLoadedSource;
  suggestedName: string;
};

/** Parse dropped GIS file(s) and build loaded-source + suggested layer name. */
export async function parseCreateControlUploadedFiles(
  files: Array<Blob & { name?: string; size?: number }>,
): Promise<CreateControlFileParseResult> {
  const { label, totalBytes, fileName } = summarizeCreateControlUploadFiles(files);
  const { geojson, crs, format } = await loadGisFileAsync(files);
  if (!geojson) {
    throw new Error('Unsupported or invalid GIS data');
  }
  return {
    geojson,
    crs,
    format,
    loadedSource: buildCreateControlLoadedSource({
      kind: 'file',
      label,
      detail:
        files.length > 1
          ? files.map((f) => f.name).filter(Boolean).join(', ')
          : undefined,
      bytes: totalBytes,
      format,
      geojson,
    }),
    suggestedName: layerNameFromFileName(fileName),
  };
}

export type CreateControlPasteParseResult = {
  geojson: GeoJSON;
  crs: string | null;
  format?: GisFormat;
  loadedSource: CreateControlLoadedSource;
};

/**
 * Parse pasted GIS text. Returns `null` when parse yields no geojson
 * (caller may still show an error if {@link looksCompleteGis}).
 */
export async function parseCreateControlPastedText(
  text: string,
  pasteLabel: string,
): Promise<CreateControlPasteParseResult | null> {
  const { geojson, crs, format } = await loadGisTextAsync(text);
  if (!geojson) return null;
  return {
    geojson,
    crs,
    format,
    loadedSource: buildCreateControlLoadedSource({
      kind: 'paste',
      label: pasteLabel,
      format,
      geojson,
    }),
  };
}

export type CreateControlVectorUrlLoadResult = {
  patch: Record<string, unknown>;
  loadedSource: CreateControlLoadedSource;
};

/** Load vector CreateControl data from a sample or arbitrary GIS URL. */
export async function loadCreateControlVectorFromUrl(options: {
  url: string;
  sampleId: string;
  currentName: string;
}): Promise<CreateControlVectorUrlLoadResult> {
  const url = options.url.trim();
  const sample = findCreateControlSampleMatchingUrl(
    'vector',
    options.sampleId,
    url,
  );

  if (sample) {
    const samplePatch = await applyCreateControlSample(sample);
    const geojson =
      (samplePatch['geojson'] as GeoJSON | null | undefined) ?? null;
    const patch: Record<string, unknown> = {
      ...samplePatch,
      name: applyCreateControlLayerName(
        options.currentName,
        sample.label,
        'vector',
      ),
    };
    return {
      patch,
      loadedSource: buildCreateControlLoadedSource({
        kind: 'url',
        label: sample.label,
        detail: shortenCreateControlUrl(url),
        geojson,
      }),
    };
  }

  const result = await loadGisUrlAsync(url);
  const patch: Record<string, unknown> = {
    geojson: result.geojson,
    name: applyCreateControlLayerName(
      options.currentName,
      layerNameFromUrl(url),
      'vector',
    ),
  };
  if (result.crs) {
    patch['crs'] = result.crs;
    patch['detectedCrs'] = result.crs;
  }
  return {
    patch,
    loadedSource: buildCreateControlLoadedSource({
      kind: 'url',
      label: shortenCreateControlUrl(url),
      detail: url,
      format: result.format,
      geojson: result.geojson,
    }),
  };
}

/** Form patch keys for syncing geojson preview + detected CRS. */
export function createControlGeojsonPreviewPatch(
  geojson: GeoJSON | null,
  crs?: string | null,
): Record<string, unknown> {
  const patch: Record<string, unknown> = { geojson };
  if (crs) {
    patch['crs'] = crs;
    patch['detectedCrs'] = crs;
  }
  if (!geojson) {
    patch['detectedCrs'] = undefined;
  }
  return patch;
}
