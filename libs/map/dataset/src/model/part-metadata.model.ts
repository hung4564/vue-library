import type { IMetadataView } from '../interfaces/dataset.parts';
import { createDatasetLeaf } from './dataset.base.function';

export function createDatasetPartMetadataComponent<
  T extends IMetadataView['metadata']
>(name: string, data: T) {
  const base = createDatasetLeaf<T>(name, data);
  return {
    ...base,
    type: 'metadata',
    metadata: data,
  };
}
