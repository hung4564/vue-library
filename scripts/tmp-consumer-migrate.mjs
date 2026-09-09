import fs from 'node:fs';
import path from 'node:path';

const ROOTS = ['libs', 'apps', 'docs'];
const EXT = new Set(['.ts', '.tsx', '.mts', '.js', '.jsx', '.vue', '.md']);
const SKIP_DIRS = new Set(['node_modules', 'dist', '.nx', 'coverage', '.git']);

const DOMAINS = {
  basemap: [
    'BASEMAP_CONTROL_LOCALE',
    'BASEMAP_PREFIX',
    'BaseMapAdapter',
    'BaseMapItem',
    'BaseMapLayer',
    'BaseMapNoneItem',
    'BaseMapRasterItem',
    'BaseMapStore',
    'BaseMapVectorItem',
    'BasemapError',
    'BasemapManager',
    'BasemapService',
    'DefaultBaseMapAdapter',
    'IBaseMapLayer',
    'INIT_BASEMAPS',
    'MittTypeBaseMap',
    'MittTypeBaseMapEventKey',
    'getLowestLayerId',
  ],
  crs: [
    'CRS_CONTROL_LOCALE',
    'CrsItem',
    'DEFAULT_CRS_ITEMS',
    'INITIAL_MAP_CRS_ITEMS',
    'MapCrsStore',
    'MittTypeMapCrs',
    'MittTypeMapCrsEventKey',
    'buildCrsSearchCatalog',
    'buildMapCrsCatalog',
    'createDefaultCrsStore',
    'formatCrsLabel',
    'getCrsInputSuggestions',
    'lookupCrsItem',
    'normalizeEpsgCode',
    'resolveCrsDisplayItems',
    'resolveCrsItemForStore',
    'resolveCrsProjection',
    'searchCrsCatalog',
  ],
  event: [
    'AnyIEvent',
    'BoxRangerCallback',
    'BoxRangerHandle',
    'EVENT_CONTROL_LOCALE',
    'Event',
    'EventBboxRanger',
    'EventBboxRangerHandle',
    'EventBboxRangerOption',
    'EventClick',
    'EventClickOption',
    'EventContextMenu',
    'EventManager',
    'EventMouseMove',
    'EventRightClick',
    'IEvent',
    'MapEventStore',
    'MittTypeMapEvent',
    'MittTypeMapEventEventKey',
    'createDefaultEventStore',
    'normalizeEventFrom',
    'startBoxRangerMap',
  ],
  image: [
    'ImageOptions',
    'MapImageEntry',
    'MapImageStore',
    'addImageForMap',
    'createDefaultImageStore',
    'loadImage',
    'styleImageToDataURL',
    'toImageDataFromRGBAImage',
  ],
  legend: [
    'Circle',
    'ExprHandlerFn',
    'ExprReturn',
    'Fill',
    'LEGEND_CONTROL_LOCALE',
    'LayerBranch',
    'LayerConfig',
    'LayerObjectKeys',
    'LegendElement',
    'LegendItem',
    'LegendLayerSpecification',
    'LegendService',
    'Line',
    'MapLegend',
    'PropsLegendOption',
    'Symbol',
    'cache',
    'exprHandler',
    'getLegendName',
    'isDisabledLegendLayer',
    'isSupportGenLayerLegend',
    'mapImageToDataURL',
  ],
  measurement: [
    'FormView',
    'IView',
    'IViewProps',
    'IViewSetting',
    'IViewSettingField',
    'MEASUREMENT_CONTROL_LOCALE',
    'MapMarkerView',
    'MapView',
    'Measure',
    'MeasureActionItem',
    'MeasureArea',
    'MeasureAzimuth',
    'MeasureDistance',
    'MeasurePoint',
    'MeasurementHandle',
    'MeasurementHandleInstance',
    'MeasurementHandleType',
    'MeasurementService',
    'View',
    'addCursorCrosshair',
    'formatAreaText',
    'formatDistanceText',
    'removeCursorCrosshair',
  ],
  menu: [
    'AddGeojsonHerePayload',
    'CreateDefaultMapContextMenuOptions',
    'MAP_CONTEXT_MENU_ID',
    'MapAddGeojsonHereDef',
    'MapAddGeojsonHereLayerType',
    'MapContextMenuAction',
    'MapContextMenuDivider',
    'MapContextMenuHeader',
    'MapContextMenuItem',
    'MapContextMenuItemId',
    'MapContextMenuLngLat',
    'MapContextMenuPoint',
    'MapContextMenuTarget',
    'MapMenuCondition',
    'MapMenuConditionContext',
    'MapMenuItemClick',
    'MapMenuItemProps',
    'centerMapHere',
    'clearAddGeojsonHereItems',
    'copyMapPointAsGeojson',
    'copyMapPointCoords',
    'copyMapPointWkt',
    'createAddGeojsonHereDef',
    'createBufferHereDef',
    'createDefaultMapContextMenuItems',
    'createMapMenuBuilder',
    'createMapMenuItemProps',
    'createMenuItemCenterMapHere',
    'createMenuItemCopyAsGeojson',
    'createMenuItemCopyCoords',
    'createMenuItemCopyWkt',
    'createMenuItemGoogleEarth',
    'createMenuItemGoogleMaps',
    'createMenuItemIdentifyHere',
    'createMenuItemQuickAnalysis',
    'createMenuItemZoomInHere',
    'createMenuItemsAddGeojsonHere',
    'filterVisibleMapMenuItems',
    'formatMapContextCoords',
    'getDefaultAddGeojsonHereItems',
    'handleMapMenuAction',
    'identifyFeaturesHere',
    'openGoogleEarth',
    'openGoogleMaps',
    'pointFeatureGeojson',
    'pointWkt',
    'resolveMapMenuCondition',
    'setAddGeojsonHereItems',
    'zoomInMapHere',
  ],
  print: [
    'CrosshairManager',
    'Format',
    'FormatType',
    'MapPrintStore',
    'PRINT_CONTROL_LOCALE',
    'PrintOption',
    'PrintOptions',
    'PrintService',
    'PrintableAreaManager',
    'createDefaultPrintStore',
    'createPrintStoreApi',
    'exportFile',
    'exportMapbox',
    'exportMapboxWithOptions',
    'getMapBoxCanvas',
    'waitMapLoadDone',
  ],
  theme: [
    'MAP_THEME_CLASS',
    'MAP_THEME_COLOR_SCHEME',
    'MAP_THEME_IDS',
    'MAP_THEME_MODES',
    'MAP_THEME_STORAGE_KEY',
    'MapThemeId',
    'MapThemeMode',
    'MapThemeResolved',
    'THEME_CONTROL_LOCALE',
    'applyMapThemeClass',
    'bootstrapMapTheme',
    'cycleMapThemeMode',
    'getMapThemeLocaleKey',
    'getPrefersDark',
    'getStoredMapThemeMode',
    'isMapThemeId',
    'isMapThemeMode',
    'normalizeMapThemeModes',
    'resolveMapTheme',
    'setStoredMapThemeMode',
    'toggleMapThemeLightDark',
  ],
  toolbar: [
    'AnyToolbarOptions',
    'AnyToolbarStrategy',
    'ControlStrategy',
    'Listener',
    'MapControlButtonState',
    'MapControlButtonUIState',
    'MapToolbarStore',
    'ModuleStrategy',
    'Subscribable',
    'TOOLBAR_STRATEGIES',
    'Toolbar',
    'ToolbarButtonConfig',
    'ToolbarKind',
    'ToolbarModuleOptions',
    'ToolbarSingleOptions',
    'ToolbarStrategy',
    'ToolbarStrategyDef',
    'WithToolbar',
    'createDefaultToolbarStore',
    'createSubscribable',
    'createToolbarControl',
    'createToolbarModule',
    'createToolbarModuleApi',
    'createToolbarStoreApi',
    'createToolbarStrategy',
  ],
};

const HOME = new Map();
for (const [domain, names] of Object.entries(DOMAINS)) {
  for (const n of names) HOME.set(n, domain);
}

const files = [];
for (const root of ROOTS) {
  if (!fs.existsSync(root)) continue;
  (function walk(dir) {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      if (SKIP_DIRS.has(e.name)) continue;
      const p = path.join(dir, e.name);
      if (e.isDirectory()) walk(p);
      else if (EXT.has(path.extname(e.name))) files.push(p);
    }
  })(root);
}

// `[^{}]*` cannot span two statements, so this cannot over-match across imports.
const RE =
  /(^[ \t]*)?(import|export)([ \t]+type)?[\s]*\{([^{}]*)\}[\s]*from[\s]*(['"])@hungpvq\/map-core\5/gm;

let touched = 0;
const stats = new Map();

for (const file of files) {
  const original = fs.readFileSync(file, 'utf8');
  if (!original.includes('@hungpvq/map-core')) continue;

  const next = original.replace(
    RE,
    (full, indent, kw, typeKw, inner, q) => {
      const parts = inner
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
      if (!parts.length) return full;

      const groups = new Map();
      for (const p of parts) {
        const bare = p.replace(/^type[\s]+/, '').split(/[\s]+as[\s]+/)[0].trim();
        const key = HOME.get(bare) ?? '';
        if (!groups.has(key)) groups.set(key, []);
        groups.get(key).push(p);
      }
      if (groups.size === 1 && groups.has('')) return full;

      const ws = indent ?? '';
      const order = [...groups.keys()].sort((a, b) =>
        a === '' ? -1 : b === '' ? 1 : a.localeCompare(b),
      );
      const stmts = order.map((domain) => {
        const spec = domain ? `@hungpvq/map-core/${domain}` : '@hungpvq/map-core';
        if (domain) stats.set(domain, (stats.get(domain) ?? 0) + 1);
        return `${kw}${typeKw ?? ''} { ${groups.get(domain).join(', ')} } from ${q}${spec}${q};`;
      });
      return `${ws}${stmts.join(`\n${ws}`)}`.replace(/;$/, '');
    },
  );

  if (next !== original) {
    fs.writeFileSync(file, next);
    touched++;
  }
}

console.log('files touched:', touched);
console.log([...stats.entries()].sort().map(([d, n]) => `${d}: ${n}`).join('\n'));
