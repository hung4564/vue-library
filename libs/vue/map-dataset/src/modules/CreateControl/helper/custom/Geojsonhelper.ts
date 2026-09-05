import { getChartRandomColor, MapError, toPlainJson } from '@hungpvq/map-core';
import type { GeojsonDatasetOption } from '@hungpvq/map-dataset';
import {
  bboxFromGeojsonAsync,
  createGeoJsonDataset,
  detectGeojsonStyleTypesAsync,
  GEOJSON_STYLE_AUTO,
  isGeojsonStyleAuto,
  reprojectGeojsonToWgs84Async,
} from '@hungpvq/map-dataset';
import { toRaw } from 'vue';
import { GeojsonSettings, GeojsonUpload } from '../../config';
import { ConfigHelper } from '../_default';

function stageError(stage: string, error: unknown): never {
  if (error instanceof MapError) {
    error.setContext({ stage });
    throw error;
  }
  const message = error instanceof Error ? error.message : String(error ?? '');
  throw new MapError(
    message || `Failed at ${stage}`,
    'LAYER_CREATE_ERROR',
    {
      recoverable: false,
      cause: error,
      context: { stage },
    },
  );
}

export class ConfigGeojsonHelper extends ConfigHelper<GeojsonDatasetOption> {
  override get dataSourceComponent() {
    return () => GeojsonUpload;
  }

  override get settingsComponent() {
    return () => GeojsonSettings;
  }

  override get default_value(): Omit<GeojsonDatasetOption, 'name'> {
    return {
      type: 'point',
      geojson: null as any,
      crs: '4326',
      color: getChartRandomColor(),
    };
  }

  override validate(form: GeojsonDatasetOption & { name?: string }) {
    if (!form.name) {
      return false;
    }
    if (!form.geojson) {
      return false;
    }
    if (!form.type) {
      return false;
    }
    return true;
  }

  override get create() {
    return async (form: GeojsonDatasetOption & { name: string }) => {
      const plain = toRaw(form);
      let geojson;
      try {
        geojson = toPlainJson(plain.geojson);
      } catch (error) {
        stageError('clone', error);
      }

      try {
        geojson = await reprojectGeojsonToWgs84Async(geojson, plain.crs);
      } catch (error) {
        stageError('reproject', error);
      }

      let styles;
      try {
        styles = isGeojsonStyleAuto(plain.type)
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
          name: plain.name,
          type: plain.type ?? GEOJSON_STYLE_AUTO,
          color: plain.color,
          opacity: plain.opacity,
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
