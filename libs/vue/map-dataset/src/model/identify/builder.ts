import {
  addFieldBuilder,
  addMenuBuilder,
  type WithFieldBuilder,
  type WithMenuBuilder,
} from '../../extra';
import type { IIdentifyView } from '../../interfaces';
import {
  createIdentifyMapboxComponent,
  createIdentifyMapboxMergedComponent,
} from './models';
interface BaseBuilder {
  configFieldId(field_id: string): this;
  setGroup(group: IIdentifyView['group']): this;
  configFieldName(field_name: string): this;
  isUseMerge(id?: string): this;
  build(): IIdentifyView;
}
export function createDatasetPartIdentifyComponentBuilder(name: string) {
  const _config: Partial<IIdentifyView['config']> = {};
  let _identifyGroupId: string | undefined = undefined;
  let _group: IIdentifyView['group'] = undefined;
  const base = {
    configFieldId(field_id: string) {
      _config.field_id = field_id;
      return this;
    },
    setGroup(group: IIdentifyView['group']) {
      _group = group;
      return this;
    },
    configFieldName(field_name: string) {
      _config.field_name = field_name;
      return this;
    },
    isUseMerge(id = 'mapbox-group') {
      _identifyGroupId = id;
      return this;
    },
    build(): IIdentifyView {
      const dataset = _identifyGroupId
        ? createIdentifyMapboxMergedComponent(name, _config, _identifyGroupId)
        : createIdentifyMapboxComponent(name, _config || {});
      dataset.group = _group;
      return dataset;
    },
  };
  return addFieldBuilder(addMenuBuilder(base)) as BaseBuilder &
    WithFieldBuilder &
    WithMenuBuilder;
}
