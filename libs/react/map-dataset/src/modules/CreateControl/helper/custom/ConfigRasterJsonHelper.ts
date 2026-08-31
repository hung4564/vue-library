import type { RasterUrlDatasetOption } from '@hungpvq/map-dataset';
import { createRasterUrlDataset } from '@hungpvq/map-dataset';
import { ConfigHelper } from '../_default';

export class ConfigRasterJsonHelper extends ConfigHelper<RasterUrlDatasetOption> {
  override get componentKey() {
    return 'create-raster-json';
  }

  override get default_value(): Omit<RasterUrlDatasetOption, 'name'> {
    return { tiles: [] };
  }

  override get create() {
    return (form: RasterUrlDatasetOption & { name: string }) => createRasterUrlDataset({ ...form });
  }
}
