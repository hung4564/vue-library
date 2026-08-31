import type { RasterUrlDatasetOption } from '@hungpvq/map-dataset';
import { createRasterUrlDataset } from '@hungpvq/map-dataset';
import { ConfigHelper } from '../_default';

type RasterUrlFormData = RasterUrlDatasetOption & { url: string };

export class ConfigRasterUrlHelper extends ConfigHelper<RasterUrlFormData> {
  override get componentKey() {
    return 'create-raster-url';
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
    return !!form.name && !!form.url;
  }

  override get create() {
    return (form: RasterUrlFormData & { name: string }) =>
      createRasterUrlDataset({ ...form, tiles: [form.url] });
  }
}
