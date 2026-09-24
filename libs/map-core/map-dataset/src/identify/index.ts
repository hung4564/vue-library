/**
 * Public entry for `@hungpvq/map-dataset/identify`.
 * Named exports only — see libs/map-core/core/docs/core/stable-api.md.
 */
export type {
  IdentifyFeatureRow,
  IdentifyMultiResult,
  IdentifyResolveFeatureQuery,
  IdentifyResolveFeatureResult,
  IIdentifyView,
} from '../interfaces/dataset.parts';
export { isIdentifyResolveFeatureQuery } from '../interfaces/dataset.parts';
export { createDatasetPartIdentifyComponentBuilder } from './builder';
export {
  closeIdentifyExclusiveUi,
  LAYER_DETAIL_CONTROL_ID,
} from './close-exclusive-ui';
export type {
  IdentifyControlModel,
  IdentifyControlModelState,
  IdentifyScopedSessionResult,
  IdentifySessionToggleResult,
} from './control-model';
export {
  buildIdentifyClosePanelPayload,
  createIdentifyControlModel,
  resolveIdentifyScopedSession,
  resolveIdentifySessionToggle,
  shouldBindIdentifyLongPress,
} from './control-model';
export type { HighlightContext } from './highlight-resolver';
export {
  createDefaultHighlightResolver,
  featuresFromIdentifyRecords,
  getGlobalHighlightResolver,
  getHighlightResolver,
  highlightResolver,
  runHighlightFromRecords,
  setGlobalHighlightResolver,
  setHighlightResolver,
} from './highlight-resolver';
export type { HighlightSessionIntent } from './highlight-session';
export {
  clearHighlight,
  clearIdentifyResultHighlight,
  onDetailClose,
  onIdentifyClose,
  paintHighlight,
  paintHighlights,
  paintIdentifyResultFocus,
  syncIdentifyPointerPick,
} from './highlight-session';
export type {
  IdentifyHitAction,
  IdentifyHitActionContext,
  IdentifyResolvedHitAction,
} from './hit-action';
export {
  resolveAutoIdentifyHitAction,
  resolveIdentifyHitAction,
  shouldOpenIdentifyAttributeTable,
  shouldOpenIdentifyShowDetail,
} from './hit-action';
export type {
  IdentifyBboxCorners,
  IdentifyInputModeFlags,
  IdentifyQueryInput,
  IdentifySession,
  IdentifySessionOptions,
} from './identify-session';
export { createIdentifySession } from './identify-session';
export { IDENTIFY_CONTROL_LOCALE } from './locale';
export {
  createDatasetPartIdentifyComponent,
  createIdentifyMapboxComponent,
  createIdentifyMapboxMergedComponent,
  ensureIdentifyShowDetailMenu,
  handleMultiIdentify,
  handleMultiIdentifyGetFirst,
} from './models';
export type { IdentifyContext } from './resolver';
export { createDefaultIdentifyResolver, identifyResolver } from './resolver';
export {
  getGlobalIdentifyResolver,
  getIdentifyResolver,
  setGlobalIdentifyResolver,
  setIdentifyResolver,
} from './resolver-registry';
export type {
  IdentifyResultGrouped,
  IdentifyResultLayerItem,
  IdentifyResultUpdatePayload,
} from './result';
export {
  groupIdentifyResults,
  IDENTIFY_ALL_LAYERS_VALUE,
  IDENTIFY_RESULT_CONTROL,
  shouldApplyIdentifyRequest,
} from './result';
export type {
  RunIdentifyMultiOptions,
  RunIdentifyResult,
  RunIdentifyShowFirstOptions,
} from './run-identify';
export {
  buildIdentifyLayerItems,
  buildIdentifyResultPanelBase,
  filterIdentifiesForControl,
  filterNonEmptyIdentifyResults,
  IDENTIFY_LOADING_LOG,
  isIdentifyAbortError,
  resolveIdentifyLayerFilterId,
  runIdentifyMulti,
  runIdentifyShowFirst,
} from './run-identify';
export type {
  IdentifyLayerFilterPayload,
  IdentifyScopeToggleResult,
} from './scope';
export {
  clearIdentifyScope,
  findListIdentifyView,
  getIdentifyScope,
  IDENTIFY_CONTROL,
  isIdentifyForListMenuHidden,
  isListIdentifyActive,
  subscribeIdentifyScope,
  toggleListIdentifyScope,
} from './scope';
export type { IdentifyFeatureResolveContext } from './source-geometry';
export {
  createIdentifyFeatureResolver,
  resolveIdentifyFeatureData,
  resolveIdentifyFeatures,
  resolveIdentifyFeaturesData,
} from './source-geometry';
