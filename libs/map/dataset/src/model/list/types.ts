import type { Color } from '@hungpvq/shared-map';
import type { WithEvent } from '../../extra';
import type { IActionForView, IDataset } from '../../interfaces';
import type {
  WithOpacity,
  WithSetOpacity,
  WithShow,
  WithToggleShow,
} from '../../interfaces/dataset.extra';

export type IListViewUI = IDataset &
  WithToggleShow &
  WithShow &
  WithOpacity &
  WithSetOpacity &
  WithEvent<EventIListViewUI> &
  IActionForView & {
    selected?: boolean;
    color?: Color;
    config: {
      disabled_delete?: boolean;
      disabled_opacity?: boolean;
      component?: any;
      init_show_legend?: boolean;
      init_show_children?: boolean;
    };
    index: number;
    group?: IGroupListViewUI<IListViewUI>;
    shows: boolean[];
    legend?: () => any;
  };

export type IGroupListViewUI<T> =
  | string
  | {
      name: string;
      id: string;
      children?: T[];
    };

export type EventIListViewUI = {
  toggleShow: { show: boolean; dataset: IListViewUI };
  changeOpacity: { opacity: number; dataset: IListViewUI };
};
