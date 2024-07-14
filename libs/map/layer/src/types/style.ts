import { Layer } from 'mapbox-gl';

export interface ITab {
  trans?: string;
  text?: string;
  key: string;
  type: string;
  format?: any;
  part?: 'layout' | 'paint';
  component?: {
    content?: () => any;
    label?: any;
  };
  props?: {
    content?: any;
    label?: any;
  };
}
export interface UnitTab extends ITab {
  unit?: string;
  type: 'unit';
}
export interface DividersTab extends ITab {
  type: 'divider';
}
export interface ColorTab extends ITab {
  unit?: string;
  type: 'color';
}
export interface OpacityTab extends ITab {
  type: 'opacity';
}
export interface NumberTab extends ITab {
  type: 'number';
  min?: number;
  max?: number;
  step?: number;
}
export interface ChoseTab extends ITab {
  type: 'chose';
  menu: {
    text?: string;
    subtitle?: string;
    text_trans?: string;
    subtitle_trans?: string;
    value: string;
  }[];
}
export type Tab =
  | DividersTab
  | ITab
  | ColorTab
  | UnitTab
  | OpacityTab
  | NumberTab
  | ChoseTab;

export type SingleTabConfig = {
  type: 'single';
  items: Tab[];
};
export type MultiTabConfig = {
  type: 'multi';
  tabs: TabConfig[];
};
export type LayerTabsConfig = SingleTabConfig | MultiTabConfig;
export type LayerTypeConfig<L = Layer> = {
  TAB: LayerTabsConfig;
  DEFAULT: Partial<L>;
};

export type TabConfig = {
  trans?: string;
  text?: string;
  items: Tab[];
};
