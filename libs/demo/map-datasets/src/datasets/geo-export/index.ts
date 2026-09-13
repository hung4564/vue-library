import {
  createDatasetPartListViewUiComponentBuilder,
  createGroupDataset,
  createMultiMapboxLayerComponent,
  createRootDataset,
  type IDataset,
} from '@hungpvq/map-dataset';
import {
  createDatasetPartAttributeTable,
  createMenuItemAttributeTable,
} from '@hungpvq/map-dataset/attribute-table';
import {
  createDatasetPartGeoExport,
  createMenuItemExportGeo,
  type GeoExportHandler,
} from '@hungpvq/map-dataset/geo-export';
import { createDatasetPartGeojsonSourceComponent } from '@hungpvq/map-dataset/geojson';
import {
  createMenuItemToggleShow,
  type MenuAction,
} from '@hungpvq/map-dataset/menu';
import { LayerSimpleMapboxBuild } from '@hungpvq/map-dataset/style';
import { demoPoint } from '../../fixtures/geojson';

const DEMO_FC = {
  type: 'FeatureCollection' as const,
  features: [
    demoPoint([105.85, 21.03], { id: '1', name: 'Hanoi' }),
    demoPoint([106.66, 10.78], { id: '2', name: 'Ho Chi Minh' }),
    demoPoint([108.2, 16.05], { id: '3', name: 'Da Nang' }),
  ],
};

/** LayerControl row names (also View source keys). */
export const GEO_EXPORT_LOCAL_MODAL_NAME = '1 · Modal · local download';
export const GEO_EXPORT_MENU_FORMATS_NAME = '2 · Menu · format submenu';
export const GEO_EXPORT_CLICK_NAME = '3 · Click · one-shot';
export const GEO_EXPORT_CUSTOM_API_NAME = '4 · onExport · mock API';
export const GEO_EXPORT_AT_SCOPES_NAME = '5 · AT · scopes + Export';
export const GEO_EXPORT_OVERRIDE_UI_NAME = '6 · Override · formComponent';

/** Short how-to for the demo LayerControl header. */
export const GEO_EXPORT_DEMO_LEGEND = [
  'All layers have Attribute table (⋮).',
  '1 Modal — Export opens modal; Download = local file',
  '2 Menu — Export shows format submenu',
  '3 Click — Export runs immediately (formats[0]=geojson)',
  '4 onExport — Download waits ~0.6s then saves mock JSON',
  '5 Scopes — AT select/search then toolbar Export',
  '6 formComponent — custom form on dataset part; Download ~1.2s',
].join('\n');

/** Mock server: delay then return a JSON Blob (lib downloads it). */
const mockServerGeoExport: GeoExportHandler = async (ctx) => {
  await new Promise((r) => setTimeout(r, 600));
  const fc = await ctx.resolveCollection();
  const body = JSON.stringify(
    {
      ok: true,
      via: 'mockServerGeoExport',
      format: ctx.format,
      filename: ctx.filename,
      scope: ctx.scope,
      count: fc?.features?.length ?? 0,
    },
    null,
    2,
  );
  return new Blob([body], { type: 'application/json' });
};

/** Slow local export so loadingComponent override is visible. */
const slowLocalGeoExport: GeoExportHandler = async (ctx) => {
  await new Promise((r) => setTimeout(r, 1200));
  await ctx.downloadLocal(ctx.format);
};

function buildManualDataset(
  name: string,
  color: string,
  menus: MenuAction[],
  parts: IDataset[] = [],
): IDataset {
  const dataset = createRootDataset(name);
  const list = createDatasetPartListViewUiComponentBuilder(name)
    .setColor(color)
    .addMenus([...menus, createMenuItemAttributeTable()])
    .build();
  const group = createGroupDataset(name);
  const layer = createMultiMapboxLayerComponent(name, [
    new LayerSimpleMapboxBuild().setStyleType('point').setColor(color).build(),
  ]);
  group.add(layer);
  group.add(list);
  dataset.add(createDatasetPartGeojsonSourceComponent(name, DEMO_FC));
  dataset.add(group);
  for (const part of parts) dataset.add(part);
  const hasAt = parts.some(
    (p) => (p as { type?: string }).type === 'attribute-table',
  );
  if (!hasAt) {
    dataset.add(createDatasetPartAttributeTable('attribute-table'));
  }
  return dataset;
}

/** (1) Default local modal. */
export function createGeoExportLocalModalDataset(): IDataset {
  return buildManualDataset(
    GEO_EXPORT_LOCAL_MODAL_NAME,
    '#3498db',
    [createMenuItemToggleShow(), createMenuItemExportGeo()],
    [createDatasetPartGeoExport('export')],
  );
}

/** (2) Format submenu (`uiMode: 'menu'` on the menu item). */
export function createGeoExportMenuFormatsDataset(): IDataset {
  return buildManualDataset(
    GEO_EXPORT_MENU_FORMATS_NAME,
    '#9b59b6',
    [
      createMenuItemToggleShow(),
      createMenuItemExportGeo({ uiMode: 'menu' }),
    ],
    [
      createDatasetPartGeoExport('export', {
        formats: ['geojson', 'csv', 'kml'],
      }),
    ],
  );
}

/** (3) One-shot click (`uiMode: 'click'`). */
export function createGeoExportClickDataset(): IDataset {
  return buildManualDataset(
    GEO_EXPORT_CLICK_NAME,
    '#16a085',
    [createMenuItemToggleShow(), createMenuItemExportGeo({ uiMode: 'click' })],
    [
      // Part drives formats + AT one-shot; menu only needs uiMode.
      createDatasetPartGeoExport('export', {
        uiMode: 'click',
        formats: ['geojson'],
      }),
    ],
  );
}

/** (4) Custom `onExport` (mock API returning Blob). */
export function createGeoExportCustomApiDataset(): IDataset {
  return buildManualDataset(
    GEO_EXPORT_CUSTOM_API_NAME,
    '#e74c3c',
    [createMenuItemToggleShow(), createMenuItemExportGeo()],
    [
      createDatasetPartGeoExport('export', {
        onExport: mockServerGeoExport,
        scopes: ['all', 'filtered', 'selected'],
      }),
    ],
  );
}

/** (5) Attribute Table scopes (all / filtered / selected). */
export function createGeoExportAtScopesDataset(): IDataset {
  return buildManualDataset(
    GEO_EXPORT_AT_SCOPES_NAME,
    '#1abc9c',
    [createMenuItemToggleShow(), createMenuItemExportGeo()],
    [
      createDatasetPartGeoExport('export', {
        scopes: ['all', 'filtered', 'selected'],
      }),
      createDatasetPartAttributeTable('attribute-table'),
    ],
  );
}

/**
 * (6) Local UI via `formComponent` / `loadingComponent`.
 * Demo pages pass Vue/React components; view-source may call with no args.
 */
export function createGeoExportOverrideUiDataset(ui: {
  formComponent?: unknown;
  loadingComponent?: unknown;
} = {}): IDataset {
  return buildManualDataset(
    GEO_EXPORT_OVERRIDE_UI_NAME,
    '#f39c12',
    [createMenuItemToggleShow(), createMenuItemExportGeo()],
    [
      createDatasetPartGeoExport('export', {
        onExport: slowLocalGeoExport,
        formComponent: ui.formComponent,
        loadingComponent: ui.loadingComponent,
      }),
    ],
  );
}

/** Layers 1–5; layer 6 is added by the demo page with a real `formComponent`. */
export const GEO_EXPORT_DEMO_DATASET_FACTORIES: Array<() => IDataset> = [
  createGeoExportLocalModalDataset,
  createGeoExportMenuFormatsDataset,
  createGeoExportClickDataset,
  createGeoExportCustomApiDataset,
  createGeoExportAtScopesDataset,
];

export { GEO_EXPORT_DEMO_HELP_SECTIONS } from './help';
