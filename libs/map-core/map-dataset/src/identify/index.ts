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
export {
  IDENTIFY_LOADING_LOG,
  buildIdentifyLayerItems,
  buildIdentifyResultPanelBase,
  filterIdentifiesForControl,
  filterNonEmptyIdentifyResults,
  isIdentifyAbortError,
  resolveIdentifyLayerFilterId,
  runIdentifyMulti,
  runIdentifyShowFirst,
} from './run-identify';
export type {
  RunIdentifyMultiOptions,
  RunIdentifyResult,
  RunIdentifyShowFirstOptions,
} from './run-identify';
export {
  buildIdentifyClosePanelPayload,
  createIdentifyControlModel,
  resolveIdentifyScopedSession,
  resolveIdentifySessionToggle,
  shouldBindIdentifyLongPress,
} from './control-model';
export type {
  IdentifyControlModel,
  IdentifyControlModelState,
  IdentifyScopedSessionResult,
  IdentifySessionToggleResult,
} from './control-model';
export {
  createIdentifySession,
} from './identify-session';
export type {
  IdentifyBboxCorners,
  IdentifyInputModeFlags,
  IdentifyQueryInput,
  IdentifySession,
  IdentifySessionOptions,
} from './identify-session';

export type {
  IIdentifyView,
  IdentifyFeatureRow,
  IdentifyMultiResult,
} from '../interfaces/dataset.parts';
