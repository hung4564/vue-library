import type { IMetadataView } from '../interfaces/dataset.parts';
import { createNamedComponent } from './base';
import { createDatasetLeaf } from './dataset.base.function';
export function createDatasetPartMetadataComponent<
  T extends IMetadataView['metadata'],
>(name: string, data: T) {
  const base = createDatasetLeaf(name);
  return createNamedComponent('MetadataComponent', {
    ...base,
    type: 'metadata',
    metadata: data,
  });
}
