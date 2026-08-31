import type { IDataset } from '@hungpvq/map-dataset';
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

type LayerForm = Record<string, unknown> & { name?: string };

/** Erased helper surface — concrete helpers differ by form shape. */
type ConfigHelperLike = {
  readonly default_value: Record<string, unknown>;
  readonly create: (form: LayerForm & { name: string }) => IDataset;
  readonly componentKey?: string;
  validate(form: LayerForm): boolean;
};

export class LayerHelper {
  private helper: ConfigHelperLike;

  constructor(type: LayerType) {
    this.helper = HelperFactory.create(type);
  }

  setType(type: LayerType) {
    this.helper = HelperFactory.create(type);
  }

  get default_value() {
    return this.helper.default_value;
  }

  get create() {
    return this.helper.create;
  }

  get componentKey() {
    return this.helper.componentKey;
  }

  validate(form: LayerForm) {
    return this.helper.validate(form);
  }
}

const HelperFactory = {
  create(type: LayerType): ConfigHelperLike {
    switch (type) {
      case 'raster-url':
        return new ConfigRasterUrlHelper() as unknown as ConfigHelperLike;
      case 'raster-json':
        return new ConfigRasterJsonHelper() as unknown as ConfigHelperLike;
      case 'geojson':
        return new ConfigGeojsonHelper() as unknown as ConfigHelperLike;
      default:
        throw new Error('not support type: ' + type);
    }
  },
};
