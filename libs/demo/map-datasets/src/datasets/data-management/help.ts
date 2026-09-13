import type { DemoHelpSection } from '../menu/help';

/**
 * Order = LayerControl top→bottom (last loaded first).
 * Titles match list / root names where possible.
 */
export const DATA_MANAGEMENT_DEMO_HELP_SECTIONS: DemoHelpSection[] = [
  {
    id: 'memory',
    title: 'Custom DataStore',
    body: 'In-memory DataStore demo. Try: open the layer; confirm features come from the custom store (see also View source).',
  },
  {
    id: 'http-custom',
    title: 'HTTP custom parseList',
    body: 'HTTP source with custom parseList. Try: page with the second bottom panel; compare parsing vs the standard HTTP list.',
  },
  {
    id: 'http',
    title: 'HTTP paged list',
    body: 'Standard HTTP data-management pager. Try: use the bottom pager (Prev / Next) and watch LayerControl / Identify update.',
  },
  {
    id: 'list-geom',
    title: 'List with geom',
    body: 'Local list items that carry geometry. Try: inspect features on the map and in the list UI.',
  },
  {
    id: 'geojson',
    title: 'GeoJSON features',
    body: 'Local GeoJSON-backed list. Try: browse rows in LayerControl; open Attribute table / Identify where menus allow.',
  },
];
