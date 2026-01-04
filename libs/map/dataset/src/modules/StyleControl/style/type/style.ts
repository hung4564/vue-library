import type { LayerSpecification } from 'maplibre-gl';

interface ITabCommon<L> {
  trans?: string;
  text?: string;
  type: string;
  format?: (value: any) => any;
  component?: {
    content?: () => unknown;
    label?: unknown;
  };
  props?: {
    content?: unknown;
    label?: unknown;
  };
  key: string;
  part?: 'paint' | 'layout';
  disabled?: (layer: L) => boolean;
}

export type ITab<L extends LayerSpecification = LayerSpecification> =
  | (ITabCommon<L> & {
      key: keyof NonNullable<L['paint']>;
      part?: 'paint';
    })
  | (ITabCommon<L> & {
      key: keyof NonNullable<L['layout']>;
      part: 'layout';
    });

export type UnitTab<L extends LayerSpecification = LayerSpecification> =
  ITab<L> & {
    unit?: string;
    type: 'unit';
  };

export type DividersTab<L extends LayerSpecification = LayerSpecification> =
  Omit<ITab<L>, 'key'> & {
    type: 'divider';
  };

export type ColorTab<L extends LayerSpecification = LayerSpecification> =
  ITab<L> & {
    unit?: string;
    type: 'color';
  };

export type OpacityTab<L extends LayerSpecification = LayerSpecification> =
  ITab<L> & {
    type: 'opacity';
  };

export type NumberTab<L extends LayerSpecification = LayerSpecification> =
  ITab<L> & {
    type: 'number';
    min?: number;
    max?: number;
    step?: number;
  };

export type ChoseTab<L extends LayerSpecification = LayerSpecification> =
  ITab<L> & {
    type: 'chose';
    menu: {
      text?: string;
      subtitle?: string;
      text_trans?: string;
      subtitle_trans?: string;
      value: string;
    }[];
  };

export type SelectTab<L extends LayerSpecification = LayerSpecification> =
  ITab<L> & {
    type: 'select';
    items: string[];
  };

export type ArrayXYTab<L extends LayerSpecification = LayerSpecification> =
  ITab<L> & {
    type: 'array-x-y';
    unit: string;
  };

export type ArrayIndexTab<L extends LayerSpecification = LayerSpecification> =
  ITab<L> & {
    type: 'array-index';
    data: {
      text: string;
      type: string;
      value: 0;
    }[];
  };

export type Tab<L extends LayerSpecification = LayerSpecification> =
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

export type SingleTabConfig<L extends LayerSpecification = LayerSpecification> =
  {
    type: 'single';
    items: Tab<L>[];
  };
export type MultiTabConfig<L extends LayerSpecification = LayerSpecification> =
  {
    type: 'multi';
    tabs: TabConfig<L>[];
  };
export type LayerTabsConfig<L extends LayerSpecification = LayerSpecification> =
  SingleTabConfig<L> | MultiTabConfig<L>;
export type LayerTypeConfig<L extends LayerSpecification = LayerSpecification> =
  {
    TAB: LayerTabsConfig<L>;
    DEFAULT: Partial<L>;
  };

export type TabConfig<L extends LayerSpecification = LayerSpecification> = {
  trans?: string;
  text?: string;
  items: Tab<L>[];
};
