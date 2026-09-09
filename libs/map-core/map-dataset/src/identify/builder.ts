import type { IIdentifyView } from '../interfaces';
import {
  addFieldBuilder,
  type WithFieldBuilder,
} from '../extra/field';
import { addMenuBuilder, type WithMenuBuilder } from '../menu';
import {
  createIdentifyMapboxComponent,
  createIdentifyMapboxMergedComponent,
  ensureIdentifyShowDetailMenu,
} from './models';
interface BaseBuilder {
  configFieldId(field_id: string): this;
  setGroup(group: IIdentifyView['group']): this;
  configFieldName(field_name: string): this;
  isUseMerge(id?: string): this;
  /**
   * Prefer Identify Result panel over auto show-detail / attribute-table
   * for this identify node (default true when called without args).
   */
  preferResultControl(value?: boolean): this;
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
    preferResultControl(value = true) {
      _config.preferResultControl = value;
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
  const composed = addFieldBuilder(addMenuBuilder(base)) as BaseBuilder &
    WithFieldBuilder &
    WithMenuBuilder;
  const originBuild = composed.build.bind(composed);
  composed.build = function build() {
    const dataset = originBuild();
    // setConfigFields applies after create; ensure menu once fields exist.
    ensureIdentifyShowDetailMenu(dataset);
    return dataset;
  };
  return composed;
}
