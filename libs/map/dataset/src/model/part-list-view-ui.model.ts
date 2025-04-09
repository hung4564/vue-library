import { Color } from '@hungpvq/shared-map';
import {
  IGroupListViewUI,
  IListViewUI,
} from '../interfaces/part-list-view-ui.interface';
import { DatasetLeaf } from './dataset.base';

export class DatasetPartListViewUiComponent extends DatasetLeaf {
  opacity = 1;
  selected = false;
  metadata: any;
  color: Color = '#fff';
  config: {
    disable_delete?: boolean;
    disabled_opacity?: boolean;
    component?: any;
  } = {};
  index = 0;
  group?: IGroupListViewUI<IListViewUI>;
  show?: boolean;
}
