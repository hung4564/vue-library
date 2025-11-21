import type { WithDataHelper } from '../extra';
import type { IDataset } from '../interfaces/dataset.base';
import type {
  WithSetOpacity,
  WithToggleShow,
} from '../interfaces/dataset.extra';
import type { IDatasetMap } from '../interfaces/dataset.map';
import type {
  IIdentifyView,
  IIdentifyViewWithMerge,
  IMapboxLayerView,
  IMapboxSourceView,
} from '../interfaces/dataset.parts';
import type { DatasetComposite, IDataManagementView } from '../model';

export function isDatasetMapHasAddToMap(
  dataset: IDataset,
): dataset is IDataset & IDatasetMap {
  if (!dataset) return false;
  return 'addToMap' in dataset;
}
export function isDatasetMapHasRemoveFromMap(
  dataset: IDataset,
): dataset is IDataset & IDatasetMap {
  if (!dataset) return false;
  return 'removeFromMap' in dataset;
}
export function isDatasetSourceMap(
  dataset: IDataset,
): dataset is IDataset & IMapboxSourceView {
  return 'removeFromMap' in dataset && 'addToMap' in dataset;
}

export function isMapboxLayerView(
  dataset: IDataset,
): dataset is IDataset & IMapboxLayerView & WithDataHelper {
  return (
    'toggleShow' in dataset &&
    'setOpacity' in dataset &&
    'moveLayer' in dataset &&
    'getBeforeId' in dataset
  );
}
export function hasMoveLayer(
  dataset: IDataset,
): dataset is IDataset & IMapboxLayerView {
  return 'moveLayer' in dataset && 'getBeforeId' in dataset;
}
export function isComposite(
  dataset: IDataset,
): dataset is IDataset & DatasetComposite {
  return (
    dataset.type === 'composite' ||
    ('getChildren' in dataset && typeof dataset.getChildren === 'function')
  );
}

export function isIdentifyMergeView(
  view: IIdentifyView,
): view is IIdentifyViewWithMerge {
  return 'identifyGroupId' in view;
}
export function isDataManagementView(
  dataset: any,
): dataset is IDataManagementView {
  return dataset?.type === 'data-management';
}
export function isDatasetHasMethod<T, K extends keyof any>(
  obj: unknown,
  methodName: K,
): obj is T & Record<K, (...args: any[]) => any> {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    typeof (obj as any)[methodName] === 'function'
  );
}

export function isHasToggleShow(dataset: any): dataset is WithToggleShow {
  return 'toggleShow' in dataset;
}

export function isHasSetOpacity(dataset: any): dataset is WithSetOpacity {
  return 'setOpacity' in dataset;
}
