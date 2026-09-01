import type { LayerSpecification } from 'maplibre-gl';
import { CIRCLE_CONFIG } from './circle';
import { FILL_CONFIG } from './fill';
import { LINE_CONFIG } from './line';
import { RASTER_CONFIG } from './raster';
import type { LayerTabsConfig, Tab } from './style';
import { SYMBOL_CONFIG } from './symbol';

export * from './style';
export { CIRCLE_CONFIG } from './circle';
export { FILL_CONFIG } from './fill';
export { LINE_CONFIG } from './line';
export { RASTER_CONFIG } from './raster';
export { SYMBOL_CONFIG } from './symbol';

export const TABS: Record<string, LayerTabsConfig<LayerSpecification>> = {
  circle: CIRCLE_CONFIG.TAB as LayerTabsConfig<LayerSpecification>,
  line: LINE_CONFIG.TAB as LayerTabsConfig<LayerSpecification>,
  fill: FILL_CONFIG.TAB as LayerTabsConfig<LayerSpecification>,
  raster: RASTER_CONFIG.TAB as LayerTabsConfig<LayerSpecification>,
  symbol: SYMBOL_CONFIG.TAB as LayerTabsConfig<LayerSpecification>,
};

export const DEFAULT_VALUE: Record<string, Partial<LayerSpecification>> = {
  circle: CIRCLE_CONFIG.DEFAULT,
  line: LINE_CONFIG.DEFAULT,
  fill: FILL_CONFIG.DEFAULT,
  raster: RASTER_CONFIG.DEFAULT,
  symbol: SYMBOL_CONFIG.DEFAULT,
};

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === 'object' && !Array.isArray(value);
}

function mergeDeep(
  ...sources: unknown[]
): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const src of sources) {
    if (!isPlainObject(src)) continue;
    for (const [key, val] of Object.entries(src)) {
      const prev = out[key];
      out[key] =
        isPlainObject(prev) && isPlainObject(val) ? mergeDeep(prev, val) : val;
    }
  }
  return out;
}

export function convertTabWithDefaultConfig(
  tabs: Tab[],
  default_config: Record<string, Partial<Tab>>,
): Tab[] {
  return tabs.map((x) => {
    if (x.type === 'divider') {
      return x;
    }
    const res = Object.assign(
      {},
      default_config['default'],
      default_config[x.type] || {},
      x,
    );
    if (!default_config[x.type]) {
      console.info('type', 'missing', x.type);
    }
    res.props = mergeDeep(
      {},
      res.props,
      (default_config[x.type] || {}).props,
      x.props,
    );
    return res;
  });
}
