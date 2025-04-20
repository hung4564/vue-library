import { IDataManagementView, IDataset } from '../../interfaces';
import { createNamedComponent } from '../base';
import { createDatasetLeaf } from '../dataset.base.function';

export function createDatasetPartDataManagementComponent<D = any>(
  name: string,
  config: {
    fields?: { trans?: string; text?: string; value: string }[];
  } = {}
): IDataManagementView<D> & IDataset {
  const base = createDatasetLeaf<typeof config>(name, config);

  return createNamedComponent('DataManagementComponent', {
    ...base,
    get type(): string {
      return 'dataManagement';
    },
    get fields() {
      return config.fields;
    },
    // Abstract methods - cần override ở component cụ thể
    showDetail(mapId: string, detail: D): void {
      throw new Error('Method showDetail not implemented.');
    },
    getList(ids?: string[]): Promise<D[]> {
      throw new Error('Method getList not implemented.');
    },
  });
}
