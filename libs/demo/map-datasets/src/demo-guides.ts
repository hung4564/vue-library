import type { DemoHelpSection } from './datasets/menu/help';
import { DATA_MANAGEMENT_DEMO_HELP_SECTIONS } from './datasets/data-management/help';
import { GEO_EXPORT_DEMO_HELP_SECTIONS } from './datasets/geo-export/help';
import { HIGHLIGHT_DEMO_HELP_SECTIONS } from './datasets/highlight/help';
import { IDENTIFY_DEMO_HELP_SECTIONS } from './datasets/identify/help';
import { IDENTIFY_PRESENT_DEMO_HELP_SECTIONS } from './datasets/identify-present/help';
import { LIST_DEMO_HELP_SECTIONS } from './datasets/list/help';
import { MENU_DEMO_HELP_SECTIONS } from './datasets/menu/help';

export type DemoFramework = 'vue' | 'react';

export type DemoPageGuide = {
  intro?: string;
  sections: DemoHelpSection[];
};

export type GetDemoPageGuideOptions = {
  /** When set, routes marked react-only are omitted for vue (and vice versa if added later). */
  framework?: DemoFramework;
};

function guide(
  intro: string,
  sections: Array<[string, string, string]>,
): DemoPageGuide {
  return {
    intro,
    sections: sections.map(([id, title, body]) => ({ id, title, body })),
  };
}

/** Routes available in one framework only (hash path without trailing slash). */
const REACT_ONLY_ROUTES = new Set(['/map-dataset']);

/** Per-route Demo guide copy (hash path without trailing slash). */
const DEMO_PAGE_GUIDES: Record<string, DemoPageGuide> = {
  '/': guide('Kitchen-sink map. Open ☰ AsideControl (top-left) to jump to focused demos.', [
    [
      'explore',
      'Explore',
      'Toolbar, measurement, draw, identify, layers, registry, workers, print, and more are mounted together.',
    ],
    [
      'aside',
      'Navigation',
      'Use AsideControl to open Minimal, Menu, Identify, Draw, etc.',
    ],
  ]),

  '/map-core': guide('Baseline map with core controls only (no dataset UI).', [
    [
      'controls',
      'Corner controls',
      'Try goto, info, worker, CRS, globe, settings, zoom, basemap, geolocate, coordinates, context menu.',
    ],
    [
      'workers',
      'Workers',
      'Open the Workers control to inspect tasks and logs.',
    ],
  ]),

  '/minimal': guide('Minimal starter: Map + LayerControl + sample GeoJSON.', [
    [
      'layers',
      'Layers',
      'Open LayerControl (top-left) to toggle the auto-loaded sample layer.',
    ],
    [
      'basemap',
      'Basemap',
      'Switch basemap from the bottom-left control.',
    ],
  ]),

  '/worker-sample': guide('Run a sample GIS worker task and watch progress.', [
    [
      'run',
      'Run sum-range',
      'Set From/To in the side panel, then Run.',
    ],
    [
      'inspect',
      'Workers control',
      'Also open Workers on the map to watch progress and shared logs.',
    ],
  ]),

  '/toolbar': guide('Controls slotted into ToolbarControl.', [
    [
      'toolbar',
      'Toolbar',
      'Measurement, legend, print, zoom, home, goto live in the toolbar host.',
    ],
    [
      'try',
      'Try',
      'Run measurement and print / advanced-print from the toolbar.',
    ],
  ]),

  '/mobile-menu': guide('How buttonInMobile changes control layout ≤640px.', [
    [
      'modes',
      'Modes',
      'Top bar: switch buttonInMobile between button / toolbar / menu.',
    ],
    [
      'resize',
      'Resize',
      'Use width ≤640px (or DevTools mobile) to see promote / corner menu behavior.',
    ],
  ]),

  '/legend': guide('Legend swatches for sample line / fill / symbol layers.', [
    [
      'inspect',
      'Inspect',
      'On load, layers and legend entries are built — check patterns, dashes, icons, labels.',
    ],
  ]),

  '/draw': guide('DrawControl: create and edit draft features.', [
    [
      'draw',
      'Draw',
      'Open DrawControl (top-right); draw point, line, or polygon.',
    ],
    [
      'edit',
      'Edit',
      'Finished shapes stay on the map; click them to select / edit.',
    ],
  ]),

  '/basemap': guide('Basemap switching and preview cards.', [
    [
      'switch',
      'Switch',
      'Use BaseMapControl (bottom-left) and BaseMapTagControl to change basemaps.',
    ],
    [
      'card',
      'Preview',
      'Check BaseMapCard preview after load (top-right / list slot).',
    ],
  ]),

  '/measurement': guide('Measure distance / area / point on the map.', [
    [
      'measure',
      'Measure',
      'Open MeasurementControl and draw measurements.',
    ],
    [
      'vue-add',
      'Vue: add to layer',
      'Vue demo can push measurement geometry into LayerControl via “add to layer”.',
    ],
  ]),

  '/dataset-highlight': {
    intro:
      'Each LayerControl row is a different highlight strategy. Hover / click features on that layer to compare.',
    sections: HIGHLIGHT_DEMO_HELP_SECTIONS,
  },

  '/dataset-identify': {
    intro:
      'Open LayerControl and IdentifyControl. Each row below is a layer (or group) on the map — try the steps for that demo.',
    sections: IDENTIFY_DEMO_HELP_SECTIONS,
  },

  '/dataset-identify-present': {
    intro:
      'Four zones with different present menus after identify. Open Identify, click features in each zone / layer.',
    sections: IDENTIFY_PRESENT_DEMO_HELP_SECTIONS,
  },

  '/dataset-menu': {
    intro:
      'Each LayerControl row is one menu pattern. Open the layer, try the menus noted below; use Identify / Detail where called out.',
    sections: MENU_DEMO_HELP_SECTIONS,
  },

  '/dataset-list': {
    intro:
      'Each LayerControl row demos list UI / menus. Use the header admin / pen checkboxes for the conditions row.',
    sections: LIST_DEMO_HELP_SECTIONS,
  },

  '/registry-control': guide('Many controls registered; RegistryControl toggles them.', [
    [
      'mount',
      'Mounted together',
      'Measurement, identify, draw, print, and more are registered at once.',
    ],
    [
      'registry',
      'RegistryControl',
      'Open RegistryControl (top-right) to show / hide registered controls.',
    ],
  ]),

  '/dataset-data-management': {
    intro:
      'Bottom pagers drive HTTP lists; LayerControl lists the loaded data-management demos.',
    sections: DATA_MANAGEMENT_DEMO_HELP_SECTIONS,
  },

  '/dataset-attribute-table': {
    intro:
      'Same data-management layers as the DM demo. Bottom panel opens AttributeTable with UI / column overrides; use LayerControl to pick a layer first.',
    sections: [
      ...DATA_MANAGEMENT_DEMO_HELP_SECTIONS,
      {
        id: 'open-table',
        title: 'Open table (bottom panel)',
        body: 'Pick layer + override, then Open / Open+columns / Open+ui / Open+cell-header. Try queueSelectRows, actionSelectRows, and toggleShow.',
      },
    ],
  },

  '/dataset-geo-export': {
    intro:
      'Each LayerControl row is an export pattern (see also the header legend). All rows include Attribute table in ⋮.',
    sections: GEO_EXPORT_DEMO_HELP_SECTIONS,
  },

  '/story-telling': guide('Chapter playback on the map (Vue has the full action engine).', [
    [
      'vue',
      'Vue',
      'Play / Pause / Prev / Next — chapters zoom, pan, rotate, draw route, orbit, highlight DOM.',
    ],
    [
      'react',
      'React',
      'Simplified 3-chapter flyTo (Hanoi → HCMC → reset).',
    ],
  ]),

  '/story-telling-gps': guide('GPS track playback with a moving marker.', [
    [
      'vue',
      'Vue',
      'Play chapter playback — red marker animates along the GPS track with a trail.',
    ],
    [
      'react',
      'React',
      'Use Play trail / Reset in the side panel for marker + line animation.',
    ],
  ]),

  '/map-dataset': guide('React-only: loads all demo datasets on map load.', [
    [
      'explore',
      'Explore',
      'Use LayerControl, DatasetControl, Identify, measurement, and event controls.',
    ],
  ]),
};

export function getDemoPageGuide(
  pathname: string,
  options?: GetDemoPageGuideOptions,
): DemoPageGuide | undefined {
  const key = pathname.replace(/\/+$/, '') || '/';
  if (options?.framework === 'vue' && REACT_ONLY_ROUTES.has(key)) {
    return undefined;
  }
  return DEMO_PAGE_GUIDES[key] ?? DEMO_PAGE_GUIDES[`/${key.replace(/^\//, '')}`];
}
