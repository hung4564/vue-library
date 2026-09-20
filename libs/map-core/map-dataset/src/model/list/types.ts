import type { Color } from '@hungpvq/map-core';
import type { WithEventHelper } from '../../extra/event/types';
import type { IDataset } from '../../interfaces/dataset.base';
import type { WithMenuHelper } from '../../interfaces/dataset.parts';
import type {
  WithOpacity,
  WithSetOpacity,
  WithShow,
  WithToggleShow,
} from '../../interfaces/dataset.extra';
import type { ComponentType } from '../../types';
import type { GroupTree, Item, TreeItem } from '../../utils/tree';

export type IListViewUI = IDataset &
  WithToggleShow &
  WithShow &
  WithOpacity &
  WithSetOpacity &
  WithEventHelper<EventIListViewUI> &
  WithMenuHelper & {
    selected?: boolean;
    color?: Color;
    config: {
      disabled_delete?: boolean;
      disabled_opacity?: boolean;
      disabled_move?: boolean;
      disabled_add_to_group?: boolean;
      componentKey?: string;
      init_show_legend?: boolean;
      init_show_children?: boolean;
    };
    index: number;
    group?: IGroupListViewUI<IListViewUI>;
    shows: boolean[];
    legend?: ComponentType;
    icon?: ComponentType;
  };

export type IGroupListViewUI<T> =
  | string
  | {
      name: string;
      id: string;
      children?: T[];
    };

export type EventIListViewUI = {
  toggleShow: { show: boolean; dataset: IListViewUI; mapId: string };
  changeOpacity: { opacity: number; dataset: IListViewUI; mapId: string };
};

/** Normalized flat-list group reference (written by convertTreeToList / order helpers). */
export type ListViewGroupRef = { id: string; name: string };

/** Flat layer row for layer-control draggable lists. */
export type LayerListItem = IListViewUI &
  Item & {
    group?: ListViewGroupRef;
  };

export type LayerListGroupTree = GroupTree<LayerListItem>;
export type LayerListTreeNode = TreeItem<LayerListItem>;
