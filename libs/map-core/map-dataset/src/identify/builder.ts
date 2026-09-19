import type { IIdentifyView } from '../interfaces/dataset.parts';
import {
  addFieldBuilder,
  type WithFieldBuilder,
} from '../extra/field';
import { addMenuBuilder } from '../menu/builder';
import type { WithMenuBuilder } from '../menu/types';
import type { IdentifyHitAction } from './hit-action';
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
  /** UI policy when exactly one feature is hit. */
  onSingle(action: IdentifyHitAction): this;
  /** UI policy when multiple features are hit (`detail` = first/top feature). */
  onMultiple(action: IdentifyHitAction): this;
  /** Optional geometry enrichment after data-management `get`. */
  setGetFeature(getFeature: NonNullable<IIdentifyView['getFeature']>): this;
  build(): IIdentifyView;
}

export function createDatasetPartIdentifyComponentBuilder(name: string) {
  const _config: Partial<IIdentifyView['config']> = {};
  let _identifyGroupId: string | undefined = undefined;
  let _group: IIdentifyView['group'] = undefined;
  let _getFeature: IIdentifyView['getFeature'] | undefined;
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
    onSingle(action: IdentifyHitAction) {
      _config.onSingle = action;
      return this;
    },
    onMultiple(action: IdentifyHitAction) {
      _config.onMultiple = action;
      return this;
    },
    setGetFeature(getFeature: NonNullable<IIdentifyView['getFeature']>) {
      _getFeature = getFeature;
      return this;
    },
    build(): IIdentifyView {
      const options = _getFeature ? { getFeature: _getFeature } : undefined;
      const dataset = _identifyGroupId
        ? createIdentifyMapboxMergedComponent(
            name,
            _config,
            _identifyGroupId,
            options,
          )
        : createIdentifyMapboxComponent(name, _config || {}, options);
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
    ensureIdentifyShowDetailMenu(dataset);
    return dataset;
  };
  return composed;
}
