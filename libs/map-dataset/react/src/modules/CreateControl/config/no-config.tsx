import type { CreateConfigFormProps } from './types';

/** Empty data-source host — mirrors Vue `no-config.vue`. */
export function ConfigNo(_props: CreateConfigFormProps) {
  return <div className="map-row" />;
}
