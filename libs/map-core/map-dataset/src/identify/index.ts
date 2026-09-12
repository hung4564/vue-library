/**
 * Public entry for `@hungpvq/map-dataset/identify`.
 * Named exports only — see libs/map-core/core/docs/core/stable-api.md.
 */
export { createDatasetPartIdentifyComponentBuilder } from './builder';
export {
  createDatasetPartIdentifyComponent,
  createIdentifyMapboxComponent,
  createIdentifyMapboxMergedComponent,
  ensureIdentifyShowDetailMenu,
  handleMultiIdentify,
  handleMultiIdentifyGetFirst,
} from './models';
export { IDENTIFY_CONTROL_LOCALE } from './locale';
export { identifyResolver } from './resolver';
export {
  IDENTIFY_ALL_LAYERS_VALUE,
  IDENTIFY_RESULT_CONTROL,
  groupIdentifyResults,
} from './result';
export type {
  IdentifyResultGrouped,
  IdentifyResultLayerItem,
  IdentifyResultUpdatePayload,
} from './result';
export {
  IDENTIFY_CONTROL,
  clearIdentifyScope,
  findListIdentifyView,
  getIdentifyScope,
  isIdentifyForListMenuHidden,
  isListIdentifyActive,
  subscribeIdentifyScope,
  toggleListIdentifyScope,
} from './scope';
export type {
  IdentifyLayerFilterPayload,
  IdentifyScopeToggleResult,
} from './scope';

export type {
  IIdentifyView,
  IdentifyFeatureRow,
  IdentifyMultiResult,
} from '../interfaces';
