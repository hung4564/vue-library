import { IDataManagementView } from '../interfaces';
import LayerDetail from '../modules/LayerDetail/LayerDetail.vue';
import { addComponent } from '../store';
import { DatasetLeaf } from './dataset.base';

export abstract class DatasetPartDataManagementComponent<D = any>
  extends DatasetLeaf<{
    fields: { trans?: string; text?: string; value: string }[];
  }>
  implements IDataManagementView<D>
{
  override get type(): string {
    return 'dataManagement';
  }
  abstract showDetail(mapId: string, detail: D): void;
  get fields() {
    return this.data?.fields;
  }
}

export class DataManagementMapboxComponent extends DatasetPartDataManagementComponent {
  showDetail(mapId: string, detail: any): void {
    addComponent(mapId, {
      component: () => LayerDetail,
      attr: {
        item: detail,
        fields: this.fields,
      },
    });
  }
}
