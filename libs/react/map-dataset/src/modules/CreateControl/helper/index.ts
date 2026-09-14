import {
  LAYER_TYPES,
  LayerHelper as CoreLayerHelper,
  type LayerType,
} from '@hungpvq/map-dataset/create-control';

export { LAYER_TYPES, type LayerType };

const COMPONENT_KEYS: Record<LayerType, string> = {
  vector: 'create-geojson',
  rasterxyz: 'create-raster-json',
};

/** React UI binder over core create/validate helpers. */
export class LayerHelper {
  private core: CoreLayerHelper;
  private type: LayerType;

  constructor(type: LayerType) {
    this.type = type;
    this.core = new CoreLayerHelper(type);
  }

  setType(type: LayerType) {
    this.type = type;
    this.core.setType(type);
  }

  get default_value() {
    return this.core.default_value;
  }

  get create() {
    return this.core.create;
  }

  get componentKey() {
    return COMPONENT_KEYS[this.type];
  }

  validationErrors(form: Record<string, unknown> & { name?: string }) {
    return this.core.validationErrors(form);
  }

  validate(form: Record<string, unknown> & { name?: string }) {
    return this.core.validate(form);
  }
}
