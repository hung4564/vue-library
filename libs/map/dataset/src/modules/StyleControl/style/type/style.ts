import type { Layer } from 'mapbox-gl';

interface ITabCommon<L> {
  trans?: string;
  text?: string;
  type: string;
  format?: any;
  component?: {
    content?: () => any;
    label?: any;
  };
  props?: {
    content?: any;
    label?: any;
  };
  key: string;
  part?: 'paint' | 'layout';
  disabled?: (layer: L) => boolean;
}

export type ITab<L extends Layer = Layer> =
  | (ITabCommon<L> & {
      key: keyof NonNullable<L['paint']>;
      part?: 'paint';
    })
  | (ITabCommon<L> & {
      key: keyof NonNullable<L['layout']>;
      part: 'layout';
    });

export type UnitTab<L extends Layer = Layer> = ITab<L> & {
  unit?: string;
  type: 'unit';
};

export type DividersTab<L extends Layer = Layer> = Omit<ITab<L>, 'key'> & {
  type: 'divider';
};

export type ColorTab<L extends Layer = Layer> = ITab<L> & {
  unit?: string;
  type: 'color';
};

export type OpacityTab<L extends Layer = Layer> = ITab<L> & {
  type: 'opacity';
};

export type NumberTab<L extends Layer = Layer> = ITab<L> & {
  type: 'number';
  min?: number;
  max?: number;
  step?: number;
};

export type ChoseTab<L extends Layer = Layer> = ITab<L> & {
  type: 'chose';
  menu: {
    text?: string;
    subtitle?: string;
    text_trans?: string;
    subtitle_trans?: string;
    value: string;
  }[];
};

export type SelectTab<L extends Layer = Layer> = ITab<L> & {
  type: 'select';
  items: string[];
};

export type ArrayXYTab<L extends Layer = Layer> = ITab<L> & {
  type: 'array-x-y';
  unit: string;
};

export type ArrayIndexTab<L extends Layer = Layer> = ITab<L> & {
  type: 'array-index';
  data: {
    text: string;
    type: string;
    value: 0;
  }[];
};

export type Tab<L extends Layer = Layer> =
  | DividersTab
  | ITab<L>
  | ColorTab<L>
  | UnitTab<L>
  | OpacityTab<L>
  | NumberTab<L>
  | ChoseTab<L>
  | SelectTab<L>
  | ArrayXYTab<L>
  | ArrayIndexTab<L>;

export type SingleTabConfig<L extends Layer = Layer> = {
  type: 'single';
  items: Tab<L>[];
};
export type MultiTabConfig<L extends Layer = Layer> = {
  type: 'multi';
  tabs: TabConfig<L>[];
};
export type LayerTabsConfig<L extends Layer = Layer> =
  | SingleTabConfig<L>
  | MultiTabConfig<L>;
export type LayerTypeConfig<L extends Layer = Layer> = {
  TAB: LayerTabsConfig<L>;
  DEFAULT: Partial<L>;
};

export type TabConfig<L extends Layer = Layer> = {
  trans?: string;
  text?: string;
  items: Tab<L>[];
};
