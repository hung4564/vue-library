import type { IListViewUI, MenuAction } from '@hungpvq/map-dataset';

export interface WithLayerItemActionType {
  item: MenuAction<IListViewUI>;
  data: IListViewUI;
  mapId: string;
  disabled?: boolean;
}
