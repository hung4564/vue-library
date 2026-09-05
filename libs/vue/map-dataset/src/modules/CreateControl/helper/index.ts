import type { IDataset } from '@hungpvq/map-dataset';
import { ConfigNo } from '../config';
import type { ConfigHelper } from './_default';
import { ConfigGeojsonHelper, ConfigRasterJsonHelper } from './custom';

export const LAYER_TYPES = {
  vector: 'Vector layer',
  rasterxyz: 'Raster XYZ layer',
} as const;

export type LayerType = keyof typeof LAYER_TYPES;

export class LayerHelper {
  private helper: ConfigHelper<any>;

  constructor(type: LayerType) {
    this.helper = HelperFactory.create(type);
  }

  public setType(type: LayerType) {
    this.helper = HelperFactory.create(type);
  }

  get default_value(): Record<string, unknown> {
    return this.helper.default_value;
  }

  get create(): (form: any) => IDataset | Promise<IDataset> {
    return this.helper.create;
  }

  get dataSourceComponent(): () => any {
    return this.helper.dataSourceComponent || (() => ConfigNo);
  }

  get settingsComponent(): () => any {
    return this.helper.settingsComponent || (() => ConfigNo);
  }

  get hasLayerSettings(): boolean {
    return this.helper.hasLayerSettings;
  }

  get component(): () => any {
    return this.dataSourceComponent;
  }

  validate(form: any): boolean {
    return this.helper.validate(form);
  }
}

const HelperFactory = {
  create(type: LayerType): ConfigHelper<any> {
    switch (type) {
      case 'rasterxyz':
        return new ConfigRasterJsonHelper();
      case 'vector':
        return new ConfigGeojsonHelper();
      default:
        throw new Error('not support type: ' + type);
    }
  },
};
