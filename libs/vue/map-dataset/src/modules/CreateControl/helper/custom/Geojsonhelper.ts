import { getChartRandomColor } from '@hungpvq/map-core';
import type { GeojsonDatasetOption } from '@hungpvq/map-dataset';
import {
  createGeoJsonDataset,
  reprojectGeojsonToWgs84Async,
} from '@hungpvq/map-dataset';
import { GeojsonSettings, GeojsonUpload } from '../../config';
import { ConfigHelper } from '../_default';

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
      const geojson = await reprojectGeojsonToWgs84Async(form.geojson, form.crs);
      return createGeoJsonDataset({
        ...form,
        geojson,
        crs: undefined,
      });
    };
  }
}
