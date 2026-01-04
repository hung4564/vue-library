import type { IDataset } from '../../../interfaces';
import { ConfigNo } from '../config';
import type { ConfigHelper } from './_default';
import {
  ConfigGeojsonHelper,
  ConfigRasterJsonHelper,
  ConfigRasterUrlHelper,
} from './custom';

export const LAYER_TYPES = {
  'raster-url': 'Raster url layer',
  'raster-json': 'Raster json layer',
  geojson: 'Geojson layer',
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

  get create(): (form: any) => IDataset {
    return this.helper.create;
  }

  get component(): () => any {
    return this.helper.component || (() => ConfigNo);
  }

  validate(form: any): boolean {
    return this.helper.validate(form);
  }
}

const HelperFactory = {
  create(type: LayerType): ConfigHelper<any> {
    switch (type) {
      case 'raster-url':
        return new ConfigRasterUrlHelper();
      case 'raster-json':
        return new ConfigRasterJsonHelper();
      case 'geojson':
        return new ConfigGeojsonHelper();
      default:
        throw new Error('not support type: ' + type);
    }
  },
};
