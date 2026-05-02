import type { RasterUrlDatasetOption } from '../../../../builder';
import { createRasterUrlDataset } from '../../../../builder';
import { ConfigRasterUrl } from '../../config';
import { ConfigHelper } from '../_default';

type RasterUrlFormData = RasterUrlDatasetOption & { url: string };

export class ConfigRasterUrlHelper extends ConfigHelper<RasterUrlFormData> {
  override get component() {
    return () => ConfigRasterUrl;
  }

  override get default_value(): Omit<RasterUrlFormData, 'name'> {
    return {
      bounds: [-180, -85.051129, 180, 85.051129],
      minzoom: 0,
      maxzoom: 24,
      url: '',
      tiles: [],
    };
  }

  override validate(form: RasterUrlFormData & { name?: string }) {
    if (!form.name) {
      return false;
    }
    if (!form.url) {
      return false;
    }
    return true;
  }

  override get create() {
    return (form: RasterUrlFormData & { name: string }) => {
      return createRasterUrlDataset({
        ...form,
        tiles: [form.url],
      });
    };
  }
}
