import type { IDataset } from '@hungpvq/map-dataset';

export type AddDatasetFn = (dataset: IDataset) => void | Promise<void>;

export async function loadDemoDatasets(
  add: AddDatasetFn,
  factories: Array<() => IDataset>,
) {
  for (const factory of factories) {
    await add(factory());
  }
}
