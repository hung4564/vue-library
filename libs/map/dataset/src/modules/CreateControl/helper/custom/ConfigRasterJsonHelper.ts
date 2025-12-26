import type { RasterUrlDatasetOption } from '../../../../builder';
import { createRasterUrlDataset } from '../../../../builder';
import { ConfigRasterJson } from '../../config';
import { ConfigHelper } from '../_default';

export class ConfigRasterJsonHelper extends ConfigHelper<RasterUrlDatasetOption> {
  override get component() {
    return () => ConfigRasterJson;
  }

  override get default_value(): Omit<RasterUrlDatasetOption, 'name'> {
    return {
      tiles: [],
    };
  }

  override validate(form: RasterUrlDatasetOption & { name?: string }) {
    if (!form.name) {
      return false;
    }
    return true;
  }

  override get create() {
    return (form: RasterUrlDatasetOption & { name: string }) => {
      return createRasterUrlDataset({
        ...form,
      });
    };
  }
}
