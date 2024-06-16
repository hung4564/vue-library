import { ABuild, ILayer } from '@hungpvq/vue-map-core';
import { mdiInformationOutline } from '@mdi/js';
import LayerInfo from '../../modules/part/detail/layer-info.vue';

const KEY = 'show_info';
type LayerInfoOption = {
  fields: {
    trans?: string;
    text?: string;
    value: string | undefined | ((layer: ILayer) => string | undefined);
    inline?: boolean;
  }[];
};

export class LayerInfoShowBuild extends ABuild<LayerInfoOption> {
  constructor({ fields }: LayerInfoOption) {
    super(KEY, { fields });
  }
  setForLayer(layer: ILayer) {
    layer.getView('action').addAction({
      id: KEY,
      component: () => LayerInfo,
      menu: {
        id: KEY,
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
