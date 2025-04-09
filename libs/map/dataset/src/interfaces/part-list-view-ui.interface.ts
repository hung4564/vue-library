import { Color } from '@hungpvq/shared-map';

// === list ===
export type IGroupListViewUI<T> =
  | string
  | {
      name: string;
      id: string;
      children?: T[];
    };
export type IListViewUI = {
  name?: string;
  opacity: number;
  selected: boolean;
  metadata: any;
  color: Color;
  config: {
    disable_delete?: boolean;
    disabled_opacity?: boolean;
    component?: any;
  };
  index: number;
  group?: IGroupListViewUI<IListViewUI>;
  show: any;
};
