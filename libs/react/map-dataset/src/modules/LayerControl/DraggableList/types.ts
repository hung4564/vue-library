import type { GroupTree, IListViewUI, Item, TreeItem } from '@hungpvq/map-dataset';

export type LayerListItem = IListViewUI &
  Item & {
    group?: { id: string; name: string };
  };

export type { GroupTree };
export type TreeNode = TreeItem<LayerListItem>;
