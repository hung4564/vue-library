/**
 * Shared AsideControl nav for Vue + React demo-map.
 * Paths are hash routes without trailing slash (match demo-guides keys).
 */

export type DemoAsideNavItem = {
  to: string;
  label: string;
};

/**
 * Canonical label + order for demo AsideControl (both frameworks).
 * Keep in sync with Vue router / React routes + demo-guides.
 */
export const DEMO_ASIDE_NAV_ITEMS: readonly DemoAsideNavItem[] = [
  { to: '/', label: 'Home' },
  { to: '/map-core', label: 'Map - Core' },
  { to: '/language', label: 'Language' },
  { to: '/minimal', label: 'Minimal starter' },
  { to: '/map-dataset', label: 'Map - Dataset (all)' },
  { to: '/worker-sample', label: 'Worker - Sample' },
  { to: '/toolbar', label: 'Map - Toolbar' },
  { to: '/mobile-menu', label: 'Map - Mobile menu' },
  { to: '/theme', label: 'Theme' },
  { to: '/legend', label: 'Legend' },
  { to: '/basemap', label: 'Basemap' },
  { to: '/basemap-error', label: 'Basemap error' },
  { to: '/multi-map', label: 'Multi-map' },
  { to: '/crs', label: 'CRS' },
  { to: '/print', label: 'Print' },
  { to: '/measurement', label: 'Measurement' },
  { to: '/draw', label: 'Draw' },
  { to: '/story-telling', label: 'Story telling' },
  { to: '/story-telling-gps', label: 'Story telling GPS' },
  { to: '/devtools', label: 'Devtools' },
  { to: '/dataset-highlight', label: 'Dataset - Highlight' },
  { to: '/dataset-identify', label: 'Dataset - Identify' },
  { to: '/dataset-identify-present', label: 'Dataset - Identify present' },
  { to: '/dataset-menu', label: 'Dataset - Menu' },
  { to: '/dataset-list', label: 'Dataset - List' },
  { to: '/registry-control', label: 'UniversalRegistry - Controls' },
  { to: '/dataset-data-management', label: 'Dataset - Data management' },
  { to: '/dataset-attribute-table', label: 'Dataset - Attribute table' },
  { to: '/dataset-geo-export', label: 'Dataset - Geo export' },
] as const;

export type DemoAsideFramework = 'vue' | 'react';

/** Aside links — identical for Vue and React demo-map. */
export function getDemoAsideNavItems(
  _framework: DemoAsideFramework = 'react',
): DemoAsideNavItem[] {
  return [...DEMO_ASIDE_NAV_ITEMS];
}
