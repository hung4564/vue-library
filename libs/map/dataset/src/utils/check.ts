import type { IDataset } from '../interfaces/dataset.base';
import type { IDatasetMap } from '../interfaces/dataset.map';
import type { IMapboxLayerView } from '../interfaces/dataset.parts';
import { DatasetComposite } from '../model';

// Type guard to check if a dataset implements IDatasetMap
export function isDatasetMap(
  dataset: IDataset
): dataset is IDataset & IDatasetMap {
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
