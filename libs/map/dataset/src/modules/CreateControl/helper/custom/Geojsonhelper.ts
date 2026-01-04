import type { GeojsonDatasetOption } from '../../../../builder';
import { createGeoJsonDataset } from '../../../../builder';
import { GeojsonUpload } from '../../config';
import { ConfigHelper } from '../_default';

export class ConfigGeojsonHelper extends ConfigHelper<GeojsonDatasetOption> {
  override get component() {
    return () => GeojsonUpload;
  }

  override get default_value(): Omit<GeojsonDatasetOption, 'name'> {
    return {
      type: 'point',
      geojson: null as any,
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
    return (form: GeojsonDatasetOption & { name: string }) => {
      return createGeoJsonDataset({
        ...form,
      });
    };
  }
}
