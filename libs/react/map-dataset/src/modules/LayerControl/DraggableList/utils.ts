import type { GroupTree, IListViewUI, Item, TreeItem } from '@hungpvq/map-dataset';

export type LayerListItem = IListViewUI &
  Item & {
    group?: { id: string; name: string };
  };

export type { GroupTree };
export type TreeNode = TreeItem<LayerListItem>;

export {
  convertListToTree,
  convertTreeToList,
  createDefaultGroup,
  isGroupNode,
  mergeEmptyGroups,
} from '@hungpvq/map-dataset';
