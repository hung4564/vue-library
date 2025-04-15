import type { IMetadataView } from '../interfaces/dataset.parts';
import { DatasetLeaf } from './dataset.base';

export class DatasetPartMetadataComponent
  extends DatasetLeaf<IMetadataView['metadata']>
  implements IMetadataView
{
  override get type(): string {
    return 'metadata';
  }
  get metadata(): IMetadataView['metadata'] {
    return this.data;
  }
}
