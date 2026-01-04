import { merge } from 'lodash';
import type { LayerSpecification } from 'maplibre-gl';
import { CIRCLE_CONFIG } from './circle';
import { CONFIG_TABS } from './default';
import { FILL_CONFIG } from './fill';
import { LINE_CONFIG } from './line';
import { RASTER_CONFIG } from './raster';
import type { LayerTabsConfig, Tab } from './style';
import { SYMBOL_CONFIG } from './symbol';

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
export * from './default';

export function convertTabWithDefaultConfig(
  tabs: Tab[],
  default_config = CONFIG_TABS,
) {
  return tabs.map((x) => {
    if (x.type === 'divider') {
      return x;
    }
    const res = Object.assign(
      {},
      default_config.default,
      default_config[x.type] || {},
      x,
    );
    if (!default_config[x.type]) {
      console.info('type', 'missing', x.type);
    }
    res.props = merge(
      {},
      res.props,
      (CONFIG_TABS[x.type] || {}).props,
      x.props,
    );
    return res;
  });
}
