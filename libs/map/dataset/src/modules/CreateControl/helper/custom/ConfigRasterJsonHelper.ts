import type { RasterUrlDatasetOption } from '../../../../builder';
import { createRasterUrlDataset } from '../../../../builder';
import { ConfigRasterJson } from '../../config';
import { ConfigHelper } from '../_default';

export class ConfigRasterJsonHelper extends ConfigHelper {
  get component() {
    return () => ConfigRasterJson;
  }
  validate(form: any) {
    if (!form.name) {
      return false;
    }
    if (!form.url) {
      return false;
    }
    return true;
  }
  get create() {
    return (form: RasterUrlDatasetOption) => {
      return createRasterUrlDataset({
        ...form,
      });
    };
  }
}
