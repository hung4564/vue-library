import type { RasterUrlDatasetOption } from '@hungpvq/map-dataset';
import { createRasterUrlDataset } from '@hungpvq/map-dataset';
import { ConfigHelper } from '../_default';

type RasterForm = RasterUrlDatasetOption & { url?: string };

export class ConfigRasterJsonHelper extends ConfigHelper<RasterForm> {
  override get componentKey() {
    return 'create-raster-json';
  }

  override get default_value(): Omit<RasterForm, 'name'> {
    return {
      url: '',
      tiles: [],
      bounds: [-180, -85.051129, 180, 85.051129],
      minzoom: 0,
      maxzoom: 22,
    };
  }

  override validate(form: RasterForm & { name?: string }) {
    if (!form.name) return false;
    const tiles = form.tiles ?? [];
    return !!(form.url || tiles.length);
  }

  override get create() {
    return (form: RasterForm & { name: string }) => {
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
