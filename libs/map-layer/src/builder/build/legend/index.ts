import {
  ABuild,
  AView,
  ILayerLegendView,
  ILegendOption,
  LayerLegendField,
} from '@hungpvq/vue-map-core';

import { markRaw } from 'vue';
import LayerLegendLinearGradient from './linear-gradient.vue';
import LayerLegendSingleColor from './single-color.vue';
import LayerLegendSingleText from './single-value.vue';
const KEY = 'legend';

export class LayerLegendBuild extends ABuild<ILegendOption> {
  constructor({ fields }: ILegendOption = { fields: [] }) {
    super(KEY, { fields });
    this.setBuild((_layer, option) => new LayerIdentifyView(option));
  }
  addField(field: LayerLegendField) {
    if (!this.option.fields) {
      this.option.fields = [];
    }
    this.option.fields.push(this.formatField(field));
    return this;
  }
  private formatField(field: LayerLegendField) {
    return {
      component: markRaw(field.component || LayerLegendSingleText),
      ...field,
    };
  }
  setFields(fields: LayerLegendField[] = []) {
    this.option.fields = fields.map((x) =>
      this.formatField({
        component: LayerLegendSingleText,
        ...x,
      })
    );
    return this;
  }
}
export class LayerIdentifyView extends AView implements ILayerLegendView {
  option: ILegendOption;
  constructor(option: ILegendOption) {
    super();
    this.option = option;
  }
  get config() {
    return this.option;
  }
}
export {
  LayerLegendLinearGradient,
  LayerLegendSingleColor,
  LayerLegendSingleText,
};
