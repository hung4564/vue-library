import type { IDataset } from '../interfaces/dataset.base';
import type { IDatasetMap } from '../interfaces/dataset.map';
import type {
  IDataManagementView,
  IIdentifyView,
  IIdentifyViewWithMerge,
  IMapboxLayerView,
  IMapboxSourceView,
} from '../interfaces/dataset.parts';
import { DatasetComposite } from '../model';

// Type guard to check if a dataset implements IDatasetMap
export function isDatasetMap(
  dataset: IDataset
): dataset is IDataset & IDatasetMap {
  return 'removeFromMap' in dataset && 'addToMap' in dataset;
}

export function isDatasetSourceMap(
  dataset: IDataset
): dataset is IDataset & IMapboxSourceView {
  return 'removeFromMap' in dataset && 'addToMap' in dataset;
}

// Type guard to check if a dataset implements IMapboxLayerView
export function isMapboxLayerView(
  dataset: IDataset
): dataset is IDataset & IMapboxLayerView {
  return (
    'toggleShow' in dataset &&
    'setOpacity' in dataset &&
    'moveLayer' in dataset &&
    'getBeforeId' in dataset
  );
}
// Type guard to check if a dataset implements IMapboxLayerView
export function isComposite(
  dataset: IDataset
): dataset is IDataset & DatasetComposite {
  return dataset.isComposite();
}

export function isIdentifyMergeView<T extends IDataset>(
  view: IIdentifyView<T>
): view is IIdentifyViewWithMerge<T> {
  return 'identifyGroupId' in view;
}
export function isDataManagementView(
  dataset: any
): dataset is IDataManagementView {
  return (
    dataset?.type === 'dataManagement' &&
    typeof dataset.showDetail === 'function' &&
    typeof dataset.getList === 'function'
  );
}
