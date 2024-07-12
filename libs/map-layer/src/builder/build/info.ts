import { ABuild, ILayer } from '@hungpvq/vue-map-core';
import { mdiInformationOutline } from '@mdi/js';
import LayerInfo from '../../modules/part/detail/layer-info.vue';

type LayerInfoOption = {
  fields: {
    trans?: string;
    text?: string;
    value: string | undefined | ((layer: ILayer) => string | undefined);
    inline?: boolean;
  }[];
};

export class LayerInfoShowBuild extends ABuild<LayerInfoOption> {
  constructor(options: Partial<LayerInfoOption> = {}) {
    super(options);
  }
  setFields(fields: LayerInfoOption['fields']) {
    this.option.fields = fields;
    return this;
  }
  setForLayer(layer: ILayer) {
    layer.getView('action').addAction({
      id: 'show_info',
      component: () => LayerInfo,
      menu: {
        location: 'menu',
        name: 'info',
        type: 'item',
        icon: mdiInformationOutline,
      },
      option: this.option,
    });
    return this;
  }
}
