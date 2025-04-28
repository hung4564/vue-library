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
  K extends keyof LayerBranch<Spec, T>
> = NonNullable<LayerBranch<Spec, T>[K]>;
export type PropsLegendOption<Spec> = {
  expr: <
    Spec,
    T extends LayerObjectKeys<Spec>,
    K extends keyof LayerBranch<Spec, T>
  >(
    layer: Spec,
    type: T,
    key: K
  ) => ExprReturn<Spec, T, K>;
  layer: Spec;
  image: (imageId: string) => string;
};
