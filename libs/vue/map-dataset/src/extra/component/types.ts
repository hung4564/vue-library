import type { IListViewUI, ListViewGroupOption, MenuAction } from '@hungpvq/map-dataset';

export interface WithLayerItemActionType {
  item: MenuAction<IListViewUI>;
  data: IListViewUI;
  mapId: string;
  disabled?: boolean;
}

export interface WithLayerItemMenuComponentType extends WithLayerItemActionType {
  getGroups?: () => ListViewGroupOption[];
}
