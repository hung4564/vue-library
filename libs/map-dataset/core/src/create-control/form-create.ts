import {
  bboxFromGeojson,
  type GeojsonBbox,
  getChartRandomColor,
  MapError,
  toPlainJson,
} from '@hungpvq/map-core';
import type { FeatureCollection, GeoJSON } from 'geojson';

import {
  createGeoJsonDataset,
  createGeoJsonLayersDataset,
  type GeojsonDatasetOption,
  type GeojsonLayerPart,
  splitGeojsonByGdbLayer,
} from '../geojson/builder';
import {
  GEOJSON_STYLE_AUTO,
  isGeojsonStyleAuto,
} from '../geojson/geojson-parse';
import {
  bboxFromGeojsonAsync,
  detectGeojsonStyleTypesAsync,
  reprojectGeojsonToWgs84Async,
} from '../geojson/geojson-worker.client';
import type { IDataset } from '../interfaces/dataset.base';
import {
  createRasterUrlDataset,
  type RasterUrlDatasetOption,
} from '../raster/builder';
import type { VectorTileArchiveTileKind } from '../vector-tile/archives';
import {
  createVectorTileDataset,
  type VectorTileDatasetOption,
  type VectorTileStyleMode,
} from '../vector-tile/builder';
import { featuresWithGeometry } from './filegdb-meta';

export const LAYER_TYPES = {
  geojson: 'GeoJSON / GIS',
  filegdb: 'FileGDB',
  xyz: 'XYZ URL',
  tilejson: 'TileJSON',
  mbtiles: 'MBTiles',
  pmtiles: 'PMTiles',
} as const;

export type LayerType = keyof typeof LAYER_TYPES;

const ALL_LAYER_TYPES = Object.keys(LAYER_TYPES) as LayerType[];

/**
 * Resolve CreateControl type allowlist.
 * `undefined` → all `LAYER_TYPES` (catalog order). Otherwise keep caller order,
 * drop unknown keys.
 */
export function resolveCreateControlLayerTypes(
  allowed?: readonly LayerType[] | null,
): LayerType[] {
  if (allowed == null) return [...ALL_LAYER_TYPES];
  const known = new Set(ALL_LAYER_TYPES);
  return allowed.filter((t): t is LayerType => known.has(t));
}

/** Deprecated CreateControl type keys (draft / API aliases). */
export type LegacyLayerType = 'vector' | 'rasterxyz' | 'vectortile' | 'raster';

export type LayerTypeInput = LayerType | LegacyLayerType;

export type SourceLayerOption = {
  id: string;
  enabled: boolean;
  color?: string;
  /** Attribute name → type/description from TileJSON `fields`. */
  fields?: Record<string, string>;
  /** Geometry type(s) from tilestats / layer metadata when present. */
  geometryTypes?: string[];
  description?: string;
  /** Feature count (FileGDB feature classes). */
  featureCount?: number;
};

/** Chips under CreateControl source-layer checkboxes (MBTiles / PMTiles / FileGDB). */
export function buildSourceLayerOptionMetaChips(
  opt: Pick<SourceLayerOption, 'fields' | 'geometryTypes' | 'featureCount'>,
  labels: {
    featuresCount: string;
    geometry: string;
    fields: string;
  },
): string[] {
  const chips: string[] = [];
  if (typeof opt.featureCount === 'number' && opt.featureCount > 0) {
    chips.push(`${labels.featuresCount}: ${opt.featureCount}`);
  }
  if (opt.geometryTypes?.length) {
    chips.push(`${labels.geometry}: ${opt.geometryTypes.join(', ')}`);
  }
  const fieldNames = opt.fields ? Object.keys(opt.fields) : [];
  if (fieldNames.length) {
    const preview = fieldNames
      .slice(0, 8)
      .map((name) => {
        const type = opt.fields?.[name]?.trim();
        return type ? `${name} (${type})` : name;
      })
      .join(', ');
    const more = fieldNames.length > 8 ? ` +${fieldNames.length - 8}` : '';
    chips.push(`${labels.fields}: ${preview}${more}`);
  }
  return chips;
}

export type RasterCreateForm = RasterUrlDatasetOption & {
  url?: string;
  tileKind?: VectorTileArchiveTileKind;
};

export type XyzCreateForm = RasterCreateForm &
  Partial<VectorTileDatasetOption> & {
    tileKind?: VectorTileArchiveTileKind;
    sourceLayer?: string;
    styleType?: VectorTileStyleMode;
  };

export type ArchiveCreateForm = VectorTileDatasetOption & {
  url?: string;
  archiveId?: string;
  archiveKind?: 'mbtiles' | 'pmtiles';
  tileKind?: VectorTileArchiveTileKind;
  /** Tile encoding from archive metadata (pbf/mvt/png/…). */
  format?: string;
  sourceLayerOptions?: SourceLayerOption[];
};

/** TileJSON URL form — same create path as vector archives (source-layer checkboxes). */
export type TileJsonCreateForm = VectorTileDatasetOption & {
  /** TileJSON document URL (not a tile template). */
  url?: string;
  tileKind?: VectorTileArchiveTileKind;
  format?: string;
  sourceLayerOptions?: SourceLayerOption[];
};

export type VectorTileCreateForm = ArchiveCreateForm;

/** Map deprecated draft/API keys onto current `LayerType`. */
export function normalizeLayerType(type: string | undefined | null): LayerType {
  switch (type) {
    case 'geojson':
    case 'filegdb':
    case 'xyz':
    case 'tilejson':
    case 'mbtiles':
    case 'pmtiles':
      return type;
    case 'vector':
      return 'geojson';
    case 'rasterxyz':
    case 'raster':
      return 'xyz';
    case 'vectortile':
      return 'xyz';
    default:
      return 'geojson';
  }
}

export function looksVectorXyzUrl(url: string): boolean {
  const trimmed = url.trim().toLowerCase();
  if (!trimmed) return false;
  if (trimmed.includes('.pbf')) return true;
  if (trimmed.includes('mvt')) return true;
  if (/\bvector\b/.test(trimmed) && trimmed.includes('{z}')) return true;
  return false;
}

function stageError(stage: string, error: unknown): never {
  if (error instanceof MapError) {
    error.setContext({ stage });
    throw error;
  }
  const message = error instanceof Error ? error.message : String(error ?? '');
  throw new MapError(message || `Failed at ${stage}`, 'LAYER_CREATE_ERROR', {
    recoverable: false,
    cause: error,
    context: { stage },
  });
}

function enabledSourceLayers(form: ArchiveCreateForm): string[] {
  const options = form.sourceLayerOptions;
  if (options?.length) {
    return options
      .filter((o) => o.enabled && o.id.trim())
      .map((o) => o.id.trim());
  }
  if (form.sourceLayers?.length) return form.sourceLayers;
  if (form.sourceLayer?.trim()) return [form.sourceLayer.trim()];
  return [];
}

function createFromArchiveOrVectorForm(
  form: ArchiveCreateForm & { name: string },
): IDataset {
  const tiles = form.tiles?.length ? form.tiles : form.url ? [form.url] : [];
  const tileKind = form.tileKind ?? 'vector';

  if (tileKind === 'raster') {
    return createRasterUrlDataset({
      name: form.name,
      tiles,
      bounds: form.bounds,
      minzoom: form.minzoom,
      maxzoom: form.maxzoom,
    });
  }

  const sourceLayers = enabledSourceLayers(form);
  return createVectorTileDataset({
    name: form.name,
    tiles,
    bounds: form.bounds,
    minzoom: form.minzoom,
    maxzoom: form.maxzoom,
    sourceLayers: sourceLayers.length ? sourceLayers : undefined,
    sourceLayer: sourceLayers[0],
    styleType: form.styleType ?? 'auto',
    color: form.color,
    opacity: form.opacity,
  });
}

export abstract class ConfigHelper<F = Record<string, unknown>> {
  abstract get default_value(): Omit<F, 'name'>;
  abstract get create(): (
    form: F & { name: string },
  ) => IDataset | Promise<IDataset>;

  /** Locale keys under `map.layer-control.create.*` for failed checks. */
  validationErrors(form: F & { name?: string }): string[] {
    const errors: string[] = [];
    if (!form.name) errors.push('validation-name');
    return errors;
  }

  validate(form: F & { name?: string }): boolean {
    return this.validationErrors(form).length === 0;
  }
}

export class ConfigGeojsonHelper extends ConfigHelper<GeojsonDatasetOption> {
  override get default_value(): Omit<GeojsonDatasetOption, 'name'> {
    return {
      type: 'point',
      geojson: null as unknown as GeojsonDatasetOption['geojson'],
      crs: '4326',
      color: getChartRandomColor(),
    };
  }

  override validationErrors(form: GeojsonDatasetOption & { name?: string }) {
    const errors: string[] = [];
    if (!form.name) errors.push('validation-name');
    if (!form.geojson) errors.push('validation-data');
    if (!form.type) errors.push('validation-type');
    return errors;
  }

  override validate(form: GeojsonDatasetOption & { name?: string }) {
    return this.validationErrors(form).length === 0;
  }

  override get create() {
    return async (form: GeojsonDatasetOption & { name: string }) => {
      let geojson;
      try {
        geojson = toPlainJson(form.geojson);
      } catch (error) {
        stageError('clone', error);
      }

      try {
        geojson = await reprojectGeojsonToWgs84Async(geojson, form.crs);
      } catch (error) {
        stageError('reproject', error);
      }

      let styles;
      try {
        styles = isGeojsonStyleAuto(form.type)
          ? await detectGeojsonStyleTypesAsync(geojson)
          : undefined;
      } catch (error) {
        stageError('detect-styles', error);
      }

      let bbox;
      try {
        bbox = await bboxFromGeojsonAsync(geojson);
      } catch (error) {
        stageError('bbox', error);
      }

      try {
        return createGeoJsonDataset({
          name: form.name,
          type: form.type ?? GEOJSON_STYLE_AUTO,
          color: form.color,
          opacity: form.opacity,
          geojson,
          styles,
          bbox,
          crs: undefined,
        });
      } catch (error) {
        stageError('build-dataset', error);
      }
    };
  }
}

export type FilegdbCreateForm = GeojsonDatasetOption & {
  /** Per feature-class GeoJSON from GDAL (preferred over splitting merged FC). */
  gdbLayers?: Array<{ name: string; geojson: FeatureCollection }>;
  sourceLayers?: string[];
  sourceLayerOptions?: SourceLayerOption[];
};

function enabledFileGdbLayers(form: FilegdbCreateForm): string[] | null {
  const options = form.sourceLayerOptions;
  if (options?.length) {
    return options.filter((o) => o.enabled).map((o) => o.id);
  }
  if (form.sourceLayers?.length) return form.sourceLayers;
  return null;
}

function resolveFileGdbLayerParts(form: FilegdbCreateForm): GeojsonLayerPart[] {
  const enabled = enabledFileGdbLayers(form);
  const rawLayers = form.gdbLayers?.length
    ? form.gdbLayers
    : form.geojson
      ? splitGeojsonByGdbLayer(form.geojson)
      : [];

  const filtered =
    enabled == null
      ? rawLayers
      : rawLayers.filter((layer) => enabled.includes(layer.name));

  const drawable = filtered
    .map((layer) => ({
      name: layer.name,
      geojson: {
        type: 'FeatureCollection' as const,
        features: featuresWithGeometry(layer.geojson.features ?? []),
      },
    }))
    .filter((layer) => layer.geojson.features.length > 0);

  if (drawable.length) {
    return drawable;
  }

  // Single merged FC without __gdb_layer stamps.
  if (form.geojson) {
    const features = featuresWithGeometry(
      form.geojson.type === 'FeatureCollection'
        ? (form.geojson.features ?? [])
        : form.geojson.type === 'Feature'
          ? [form.geojson]
          : [],
    );
    if (features.length) {
      return [
        {
          name: form.name,
          geojson: { type: 'FeatureCollection', features },
        },
      ];
    }
  }
  return [];
}

/** FileGDB zip/folder — one vector sublayer per feature class (MBTiles-like). */
export class ConfigFilegdbHelper extends ConfigHelper<FilegdbCreateForm> {
  override get default_value(): Omit<FilegdbCreateForm, 'name'> {
    return {
      type: GEOJSON_STYLE_AUTO,
      geojson: null as unknown as GeoJSON,
      crs: '4326',
      gdbLayers: [],
      sourceLayers: [],
      sourceLayerOptions: [],
    };
  }

  override validationErrors(form: FilegdbCreateForm & { name?: string }) {
    const errors: string[] = [];
    if (!form.name) errors.push('validation-name');
    if (!form.geojson && !form.gdbLayers?.length) {
      errors.push('validation-data');
    }
    if ((form.sourceLayerOptions?.length ?? 0) > 0) {
      const enabled = form.sourceLayerOptions!.some((o) => o.enabled);
      if (!enabled) errors.push('validation-source-layers');
    }
    return errors;
  }

  override validate(form: FilegdbCreateForm & { name?: string }) {
    return this.validationErrors(form).length === 0;
  }

  override get create() {
    return async (form: FilegdbCreateForm & { name: string }) => {
      const parts = resolveFileGdbLayerParts(form);
      if (!parts.length) {
        stageError('build-dataset', new Error('No FileGDB layers to create'));
      }

      // Always MBTiles-like auto paint (ignore any leftover form.type).
      const styleMode = GEOJSON_STYLE_AUTO;
      const prepared: GeojsonLayerPart[] = [];
      const layerBboxes: GeojsonBbox[] = [];

      for (const part of parts) {
        let geojson = toPlainJson(part.geojson);
        try {
          geojson = await reprojectGeojsonToWgs84Async(geojson, form.crs);
        } catch (error) {
          stageError('reproject', error);
        }

        let bbox: GeojsonBbox | undefined;
        try {
          bbox = (await bboxFromGeojsonAsync(geojson)) ?? undefined;
        } catch {
          bbox = undefined;
        }
        if (!bbox) {
          bbox = bboxFromGeojson(geojson) ?? undefined;
        }
        if (bbox) layerBboxes.push(bbox);

        prepared.push({
          name: part.name,
          geojson,
          type: styleMode,
          bbox,
        });
      }

      const overallBbox =
        layerBboxes.length > 0
          ? layerBboxes.reduce(
              (acc, box) => [
                Math.min(acc[0], box[0]),
                Math.min(acc[1], box[1]),
                Math.max(acc[2], box[2]),
                Math.max(acc[3], box[3]),
              ],
              layerBboxes[0],
            )
          : undefined;

      try {
        return createGeoJsonLayersDataset({
          name: form.name,
          layers: prepared,
          type: styleMode,
          opacity: form.opacity,
          bbox: overallBbox,
        });
      } catch (error) {
        stageError('build-dataset', error);
      }
    };
  }
}

export class ConfigXyzHelper extends ConfigHelper<XyzCreateForm> {
  override get default_value(): Omit<XyzCreateForm, 'name'> {
    return {
      url: '',
      tiles: [],
      bounds: [-180, -85.051129, 180, 85.051129],
      minzoom: 0,
      maxzoom: 22,
      tileKind: 'raster',
      sourceLayer: '',
      styleType: 'auto',
    };
  }

  override validationErrors(form: XyzCreateForm & { name?: string }) {
    const errors: string[] = [];
    if (!form.name) errors.push('validation-name');
    const tiles = form.tiles ?? [];
    if (!form.url && !tiles.length) errors.push('validation-url');
    return errors;
  }

  override validate(form: XyzCreateForm & { name?: string }) {
    return this.validationErrors(form).length === 0;
  }

  override get create() {
    return (form: XyzCreateForm & { name: string }) => {
      const tiles = form.tiles?.length
        ? form.tiles
        : form.url
          ? [form.url]
          : [];
      const url = form.url ?? tiles[0] ?? '';
      const tileKind =
        form.tileKind ?? (looksVectorXyzUrl(url) ? 'vector' : 'raster');

      if (tileKind === 'vector') {
        return createVectorTileDataset({
          name: form.name,
          tiles,
          bounds: form.bounds,
          minzoom: form.minzoom,
          maxzoom: form.maxzoom,
          sourceLayer: form.sourceLayer?.trim() || undefined,
          styleType: form.styleType ?? 'auto',
          color: form.color,
          opacity: form.opacity,
        });
      }

      return createRasterUrlDataset({
        name: form.name,
        tiles,
        bounds: form.bounds,
        minzoom: form.minzoom,
        maxzoom: form.maxzoom,
      });
    };
  }
}

/** @deprecated Prefer {@link ConfigXyzHelper}. */
export class ConfigRasterJsonHelper extends ConfigXyzHelper {}

function archiveDefaults(
  archiveKind: 'mbtiles' | 'pmtiles',
): Omit<ArchiveCreateForm, 'name'> {
  return {
    url: '',
    tiles: [],
    bounds: [-180, -85.051129, 180, 85.051129],
    minzoom: 0,
    maxzoom: 22,
    archiveKind,
    tileKind: 'vector',
    format: '',
    sourceLayer: '',
    sourceLayers: [],
    sourceLayerOptions: [],
    styleType: 'auto',
  };
}

function archiveValidationErrors(
  form: ArchiveCreateForm & { name?: string },
): string[] {
  const errors: string[] = [];
  if (!form.name) errors.push('validation-name');
  const tiles = form.tiles ?? [];
  if (!form.url && !tiles.length) errors.push('validation-url');
  const tileKind = form.tileKind ?? 'vector';
  if (tileKind === 'vector' && (form.sourceLayerOptions?.length ?? 0) > 0) {
    const enabled = form.sourceLayerOptions!.some((o) => o.enabled);
    if (!enabled) errors.push('validation-source-layers');
  }
  return errors;
}

export class ConfigMbtilesHelper extends ConfigHelper<ArchiveCreateForm> {
  override get default_value(): Omit<ArchiveCreateForm, 'name'> {
    return archiveDefaults('mbtiles');
  }

  override validationErrors(form: ArchiveCreateForm & { name?: string }) {
    return archiveValidationErrors(form);
  }

  override get create() {
    return (form: ArchiveCreateForm & { name: string }) =>
      createFromArchiveOrVectorForm(form);
  }
}

export class ConfigPmtilesHelper extends ConfigHelper<ArchiveCreateForm> {
  override get default_value(): Omit<ArchiveCreateForm, 'name'> {
    return archiveDefaults('pmtiles');
  }

  override validationErrors(form: ArchiveCreateForm & { name?: string }) {
    return archiveValidationErrors(form);
  }

  override get create() {
    return (form: ArchiveCreateForm & { name: string }) =>
      createFromArchiveOrVectorForm(form);
  }
}

export class ConfigTilejsonHelper extends ConfigHelper<TileJsonCreateForm> {
  override get default_value(): Omit<TileJsonCreateForm, 'name'> {
    return {
      url: '',
      tiles: [],
      bounds: [-180, -85.051129, 180, 85.051129],
      minzoom: 0,
      maxzoom: 22,
      tileKind: 'vector',
      format: '',
      sourceLayer: '',
      sourceLayers: [],
      sourceLayerOptions: [],
      styleType: 'auto',
    };
  }

  override validationErrors(form: TileJsonCreateForm & { name?: string }) {
    return archiveValidationErrors(
      form as ArchiveCreateForm & { name?: string },
    );
  }

  override get create() {
    return (form: TileJsonCreateForm & { name: string }) =>
      createFromArchiveOrVectorForm(
        form as ArchiveCreateForm & { name: string },
      );
  }
}

/** @deprecated Prefer {@link ConfigXyzHelper} / archive helpers. */
export class ConfigVectorTileHelper extends ConfigXyzHelper {}

export type LayerFormHelper = ConfigHelper<Record<string, unknown>>;

export function createLayerFormHelper(type: LayerTypeInput): LayerFormHelper {
  const normalized = normalizeLayerType(type);
  switch (normalized) {
    case 'xyz':
      return new ConfigXyzHelper() as unknown as LayerFormHelper;
    case 'geojson':
      return new ConfigGeojsonHelper() as unknown as LayerFormHelper;
    case 'filegdb':
      return new ConfigFilegdbHelper() as unknown as LayerFormHelper;
    case 'tilejson':
      return new ConfigTilejsonHelper() as unknown as LayerFormHelper;
    case 'mbtiles':
      return new ConfigMbtilesHelper() as unknown as LayerFormHelper;
    case 'pmtiles':
      return new ConfigPmtilesHelper() as unknown as LayerFormHelper;
    default:
      throw new Error('not support type: ' + type);
  }
}

/** Pure create/validate/default surface for CreateControl (no UI binders). */
export class LayerHelper {
  private helper: LayerFormHelper;

  constructor(type: LayerTypeInput) {
    this.helper = createLayerFormHelper(type);
  }

  setType(type: LayerTypeInput) {
    this.helper = createLayerFormHelper(type);
  }

  get default_value() {
    return this.helper.default_value;
  }

  get create() {
    return this.helper.create;
  }

  validationErrors(form: Record<string, unknown> & { name?: string }) {
    return this.helper.validationErrors(form);
  }

  validate(form: Record<string, unknown> & { name?: string }) {
    return this.helper.validate(form);
  }
}
