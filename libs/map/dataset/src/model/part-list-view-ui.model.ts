import { Color } from '@hungpvq/shared-map';
import {
  IGroupListViewUI,
  IListViewUI,
  MenuAction,
} from '../interfaces/dataset.parts';
import { DatasetLeaf } from './dataset.base';

export class DatasetPartListViewUiComponent
  extends DatasetLeaf
  implements IListViewUI<DatasetPartListViewUiComponent>
{
  menus: MenuAction<DatasetPartListViewUiComponent>[] = [];
  override get type(): string {
    return 'list';
  }

  opacity = 1;
  selected = false;
  color?: Color;
  config: {
    disable_delete?: boolean;
    disabled_opacity?: boolean;
    component?: any;
  } = { disable_delete: false, disabled_opacity: false };
  index = 0;
  group?: IGroupListViewUI<IListViewUI>;
  show = true;
  legend?: () => any;
}
