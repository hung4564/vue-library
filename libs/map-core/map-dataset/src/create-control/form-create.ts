import { getChartRandomColor, MapError, toPlainJson } from '@hungpvq/map-core';
import type { IDataset } from '../interfaces';
import {
  createGeoJsonDataset,
  type GeojsonDatasetOption,
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
import {
  createRasterUrlDataset,
  type RasterUrlDatasetOption,
} from '../raster/builder';

export const LAYER_TYPES = {
  vector: 'Vector layer',
  rasterxyz: 'Raster XYZ layer',
} as const;

export type LayerType = keyof typeof LAYER_TYPES;

export type RasterCreateForm = RasterUrlDatasetOption & { url?: string };

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
          bbox: bbox ?? null,
          crs: undefined,
        });
      } catch (error) {
        stageError('build-dataset', error);
      }
    };
  }
}

export class ConfigRasterJsonHelper extends ConfigHelper<RasterCreateForm> {
  override get default_value(): Omit<RasterCreateForm, 'name'> {
    return {
      url: '',
      tiles: [],
      bounds: [-180, -85.051129, 180, 85.051129],
      minzoom: 0,
      maxzoom: 22,
    };
  }

  override validationErrors(form: RasterCreateForm & { name?: string }) {
    const errors: string[] = [];
    if (!form.name) errors.push('validation-name');
    const tiles = form.tiles ?? [];
    if (!form.url && !tiles.length) errors.push('validation-url');
    return errors;
  }

  override validate(form: RasterCreateForm & { name?: string }) {
    return this.validationErrors(form).length === 0;
  }

  override get create() {
    return (form: RasterCreateForm & { name: string }) => {
      const tiles = form.tiles?.length ? form.tiles : form.url ? [form.url] : [];
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

export type LayerFormHelper = ConfigHelper<Record<string, unknown>>;

export function createLayerFormHelper(type: LayerType): LayerFormHelper {
  switch (type) {
    case 'rasterxyz':
      return new ConfigRasterJsonHelper() as unknown as LayerFormHelper;
    case 'vector':
      return new ConfigGeojsonHelper() as unknown as LayerFormHelper;
    default:
      throw new Error('not support type: ' + type);
  }
}

/** Pure create/validate/default surface for CreateControl (no UI binders). */
export class LayerHelper {
  private helper: LayerFormHelper;

  constructor(type: LayerType) {
    this.helper = createLayerFormHelper(type);
  }

  setType(type: LayerType) {
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
