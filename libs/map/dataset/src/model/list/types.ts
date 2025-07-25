import type { Color } from '@hungpvq/shared-map';
import type { WithEvent } from '../../extra';
import type { IActionForView, IDataset } from '../../interfaces';
import type { WithToggleShow } from '../../interfaces/dataset.extra';

export type IListViewUI = IDataset &
  WithToggleShow &
  WithEvent &
  IActionForView & {
    opacity: number;
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
    show?: boolean;
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
