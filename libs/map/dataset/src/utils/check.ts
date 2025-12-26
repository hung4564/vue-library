import type { WithDataHelper } from '../extra';
import type { IDataset, WithChildren } from '../interfaces/dataset.base';
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
import type { IDataManagementView } from '../model';

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
): dataset is IDataset & WithChildren {
  return (
    dataset.type === 'composite' ||
    ('getChildren' in dataset &&
      typeof (dataset as any).getChildren === 'function')
  );
}

export function isIdentifyMergeView(
  view: IIdentifyView,
): view is IIdentifyViewWithMerge {
  return 'identifyGroupId' in view;
}
export function isDataManagementView(
  dataset: unknown,
): dataset is IDataManagementView {
  return (dataset as IDataset)?.type === 'data-management';
}
export function isDatasetHasMethod<T, K extends string | number | symbol>(
  obj: unknown,
  methodName: K,
): obj is T & Record<K, (...args: unknown[]) => unknown> {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    typeof (obj as Record<string, unknown>)[methodName as string] === 'function'
  );
}

export function isHasToggleShow(dataset: unknown): dataset is WithToggleShow {
  return !!dataset && typeof dataset === 'object' && 'toggleShow' in dataset;
}

export function isHasSetOpacity(dataset: unknown): dataset is WithSetOpacity {
  return !!dataset && typeof dataset === 'object' && 'setOpacity' in dataset;
}
