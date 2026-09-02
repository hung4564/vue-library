import { getChartRandomColor } from '@hungpvq/map-core';
import type { GeojsonDatasetOption } from '@hungpvq/map-dataset';
import {
  createGeoJsonDataset,
  reprojectGeojsonToWgs84Async,
} from '@hungpvq/map-dataset';
import { ConfigHelper } from '../_default';

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

  override validate(form: GeojsonDatasetOption & { name?: string }) {
    return !!form.name && !!form.geojson && !!form.type;
  }

  override get create() {
    return async (form: GeojsonDatasetOption & { name: string }) => {
      const geojson = await reprojectGeojsonToWgs84Async(form.geojson, form.crs);
      return createGeoJsonDataset({ ...form, geojson, crs: undefined });
    };
  }
}
