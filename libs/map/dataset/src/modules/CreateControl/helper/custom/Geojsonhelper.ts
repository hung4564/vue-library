import type { GeojsonDatasetOption } from '../../../../builder';
import { createGeoJsonDataset } from '../../../../builder';
import { GeojsonUpload } from '../../config';
import { ConfigHelper } from '../_default';

export class ConfigGeojsonHelper extends ConfigHelper {
  get component() {
    return () => GeojsonUpload;
  }
  get default_value(): any {
    return {
      type: 'point',
      geojson: null,
    };
  }
  validate(form: any) {
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
  get create() {
    return (form: GeojsonDatasetOption) => {
      return createGeoJsonDataset({
        ...form,
      });
    };
  }
}
