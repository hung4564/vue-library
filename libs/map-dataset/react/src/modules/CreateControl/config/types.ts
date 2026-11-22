export type CreateConfigFormProps = {
  config: Record<string, unknown>;
  onChange: (patch: Record<string, unknown>) => void;
  trans: (key: string) => string;
  /** Required for fields that read map-scoped stores (e.g. InputCrs). */
  mapId: string;
};
