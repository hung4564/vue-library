import {
  LayerHelper as CoreLayerHelper,
  type LayerType,
} from '@hungpvq/map-dataset/create-control';
import ConfigNo from '../config/no-config.vue';
import ConfigRasterJson from '../config/xyz-json.vue';
import ConfigRasterSettings from '../config/xyz-settings.vue';
import GeojsonSettings from '../config/geojson-settings.vue';
import GeojsonUpload from '../config/geojson-upload.vue';

/** Vue UI binder over core create/validate helpers. */
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

  validationErrors(form: Record<string, unknown> & { name?: string }) {
    return this.core.validationErrors(form);
  }

  validate(form: Record<string, unknown> & { name?: string }) {
    return this.core.validate(form);
  }

  get dataSourceComponent(): () => unknown {
    switch (this.type) {
      case 'vector':
        return () => GeojsonUpload;
      case 'rasterxyz':
        return () => ConfigRasterJson;
      default:
        return () => ConfigNo;
    }
  }

  get settingsComponent(): (() => unknown) | undefined {
    switch (this.type) {
      case 'vector':
        return () => GeojsonSettings;
      case 'rasterxyz':
        return () => ConfigRasterSettings;
      default:
        return undefined;
    }
  }

  get hasLayerSettings(): boolean {
    return this.settingsComponent !== undefined;
  }

  get component(): () => unknown {
    return this.dataSourceComponent;
  }
}
