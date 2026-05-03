export type FieldFeatureDef =
  | { text: string; value: string }
  | { trans: string; value: string };
export type FieldFeaturesDef = FieldFeatureDef[];
export interface WithFieldBuilder {
  setConfigFields(fields: FieldFeaturesDef): this;
}
export function addFieldBuilder<
  TBuilder extends { build: (...args: any[]) => any },
>(builder: TBuilder): TBuilder & WithFieldBuilder {
  const _fields: FieldFeaturesDef = [];

  // lưu build gốc ra trước
  const originalBuild = builder.build;

  return Object.assign(builder, {
    setConfigFields(fields: FieldFeaturesDef) {
      _fields.push(...fields);
      return this;
    },
    build(this: TBuilder, ...args: any[]) {
      const dataset = originalBuild.apply(this, args);
      if (!dataset.config) {
        dataset.config = {};
      }
      if (_fields.length) {
        dataset.config.fields = _fields;
      }
      return dataset;
    },
  });
}
