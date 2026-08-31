import type { GeojsonDatasetOption } from '@hungpvq/map-dataset';
import { createGeoJsonDataset } from '@hungpvq/map-dataset';
import { ConfigHelper } from '../_default';

export class ConfigGeojsonHelper extends ConfigHelper<GeojsonDatasetOption> {
  override get componentKey() {
    return 'create-geojson';
  }

  override get default_value(): Omit<GeojsonDatasetOption, 'name'> {
    return { type: 'point', geojson: null as unknown as GeojsonDatasetOption['geojson'] };
  }

  override validate(form: GeojsonDatasetOption & { name?: string }) {
    return !!form.name && !!form.geojson && !!form.type;
  }

  override get create() {
    return (form: GeojsonDatasetOption & { name: string }) => createGeoJsonDataset({ ...form });
  }
}
