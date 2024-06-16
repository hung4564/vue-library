import {
  ABuild,
  AView,
  IIdentifyOption,
  ILayerIdentifyView,
} from '@hungpvq/vue-map-core';

const KEY = 'identify';

export class LayerIdentifyBuild extends ABuild<IIdentifyOption> {
  constructor(option = {}) {
    super(KEY, option);
    this.setBuild((_: any, option: any) => new LayerIdentifyView(option));
  }
  setFieldName(field_name = 'name') {
    this.option.field_name = field_name;
    return this;
  }
  setFieldId(field_id = 'id') {
    this.option.field_id = field_id;
    return this;
  }
}
export class LayerIdentifyView extends AView implements ILayerIdentifyView {
  option: IIdentifyOption;
  constructor(option: IIdentifyOption = {}) {
    super();
    this.option = option;
  }
  get name() {
    return this.parent?.info.name || '';
  }
  get config() {
    const config = {
      field_name: 'name',
      field_id: 'id',
    };
    if (this.option.field_name) {
      config.field_name = this.option.field_name;
    }

    if (this.option.field_id) {
      config.field_id = this.option.field_id;
    }
    return config;
  }
}
