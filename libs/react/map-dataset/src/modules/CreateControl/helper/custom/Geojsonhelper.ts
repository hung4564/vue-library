import { getChartRandomColor, MapError, toPlainJson } from '@hungpvq/map-core';
import type { GeojsonDatasetOption } from '@hungpvq/map-dataset/geojson';
import { bboxFromGeojsonAsync, createGeoJsonDataset, detectGeojsonStyleTypesAsync, GEOJSON_STYLE_AUTO, isGeojsonStyleAuto, reprojectGeojsonToWgs84Async } from '@hungpvq/map-dataset/geojson';
import { ConfigHelper } from '../_default';

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

export class ConfigGeojsonHelper extends ConfigHelper<GeojsonDatasetOption> {
  override get componentKey() {
    return 'create-geojson';
  }

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
