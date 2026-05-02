import type { MenuAction } from '../../interfaces';
import type { IListViewUI } from '../../model';

export interface WithLayerItemActionType {
  item: MenuAction<IListViewUI>;
  data: IListViewUI;
  mapId: string;
  disabled?: boolean;
}
