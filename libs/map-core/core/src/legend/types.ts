/**
 * Framework-agnostic legend types
 */

import type { LayerSpecification } from 'maplibre-gl';

/**
 * Legend item interface
 */
export interface LegendItem {
  id: string;
  title: string;
  visible: boolean;
}

/**
 * Layer configuration interface
 */
export interface LayerConfig {
  id: string;
  title?: string;
  visible?: boolean;
}

export type LegendLayerSpecification = LayerSpecification & {
  metadata: {
    'maplibregl-legend:disable': boolean | string;
    'maplibregl-legend:name'?: string;
  };
};

export type LayerObjectKeys<Spec> = Extract<
  {
    [P in keyof Spec]: NonNullable<Spec[P]> extends object ? P : never;
  }[keyof Spec],
  keyof Spec
>;

export type LayerBranch<Spec, K extends LayerObjectKeys<Spec>> = NonNullable<
  Spec[K]
>;

export type ExprReturn<
  Spec,
  T extends LayerObjectKeys<Spec>,
  K extends keyof LayerBranch<Spec, T>,
> = NonNullable<LayerBranch<Spec, T>[K]>;

export interface LegendElement {
  element: string;
  attributes: Record<string, any>;
  children?: LegendElement[];
}

export type ExprHandlerFn = (
  layer: LayerSpecification,
  type: string,
  prop: string,
) => string | number | boolean | null | any[];

export type PropsLegendOption<Spec> = {
  expr: ExprHandlerFn;
  layer: Spec;
  image: (imageId: string) => string;
};
