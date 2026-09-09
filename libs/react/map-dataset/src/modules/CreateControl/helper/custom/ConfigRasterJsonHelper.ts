import type { RasterUrlDatasetOption } from '@hungpvq/map-dataset/raster';
import { createRasterUrlDataset } from '@hungpvq/map-dataset/raster';
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

  override validationErrors(form: RasterForm & { name?: string }) {
    const errors: string[] = [];
    if (!form.name) errors.push('validation-name');
    const tiles = form.tiles ?? [];
    if (!form.url && !tiles.length) errors.push('validation-url');
    return errors;
  }

  override validate(form: RasterForm & { name?: string }) {
    return this.validationErrors(form).length === 0;
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
