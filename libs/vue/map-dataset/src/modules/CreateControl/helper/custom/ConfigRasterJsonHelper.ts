import type { RasterUrlDatasetOption } from '@hungpvq/map-dataset';
import { createRasterUrlDataset } from '@hungpvq/map-dataset';
import { ConfigRasterJson, ConfigRasterSettings } from '../../config';
import { ConfigHelper } from '../_default';

export class ConfigRasterJsonHelper extends ConfigHelper<RasterUrlDatasetOption> {
  override get dataSourceComponent() {
    return () => ConfigRasterJson;
  }

  override get settingsComponent() {
    return () => ConfigRasterSettings;
  }

  override get default_value(): Omit<RasterUrlDatasetOption, 'name'> & { url: string } {
    return {
      url: '',
      tiles: [],
      bounds: [-180, -85.051129, 180, 85.051129],
      minzoom: 0,
      maxzoom: 22,
    };
  }

  override validate(form: RasterUrlDatasetOption & { name?: string; url?: string }) {
    if (!form.name) {
      return false;
    }
    const url = form.url;
    const tiles = form.tiles ?? [];
    if (!url && !tiles.length) {
      return false;
    }
    return true;
  }

  override get create() {
    return (form: RasterUrlDatasetOption & { name: string; url?: string }) => {
      const tiles = form.tiles?.length ? form.tiles : form.url ? [form.url] : [];
      return createRasterUrlDataset({
        name: form.name,
        tiles,
        bounds: form.bounds,
        minzoom: form.minzoom,
        maxzoom: form.maxzoom,
      });
    };
  }
}
