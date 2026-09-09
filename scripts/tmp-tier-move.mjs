import fs from 'node:fs';
import path from 'node:path';

const SRC = path.resolve('libs/map-core/core/src');

/** old (src-relative, posix) -> new (src-relative, posix) */
const moves = {
  // ---- basemap ----
  'basemap.ts': 'basemap/init.ts',
  'basemap.spec.ts': 'basemap/init.spec.ts',
  'adapter/BaseMapAdapter.ts': 'basemap/adapter/BaseMapAdapter.ts',
  'adapter/DefaultBaseMapAdapter.ts': 'basemap/adapter/DefaultBaseMapAdapter.ts',
  'adapter/index.ts': 'basemap/adapter/index.ts',
  'model/basemap/BaseMapLayer.ts': 'basemap/model/BaseMapLayer.ts',
  'model/basemap/BaseMapLayer.spec.ts': 'basemap/model/BaseMapLayer.spec.ts',
  'model/basemap/index.ts': 'basemap/model/index.ts',
  'services/basemap.service.ts': 'basemap/basemap.service.ts',
  'services/basemap.service.spec.ts': 'basemap/basemap.service.spec.ts',
  'services/basemap-manager.service.ts': 'basemap/basemap-manager.service.ts',
  'types/basemap.ts': 'basemap/types.ts',

  // ---- measurement ----
  'model/measurement/cursor.ts': 'measurement/model/cursor.ts',
  'model/measurement/handle.ts': 'measurement/model/handle.ts',
  'model/measurement/index.ts': 'measurement/model/index.ts',
  'model/measurement/Measure.ts': 'measurement/model/Measure.ts',
  'model/measurement/Measure.spec.ts': 'measurement/model/Measure.spec.ts',
  'model/measurement/MeasureArea.ts': 'measurement/model/MeasureArea.ts',
  'model/measurement/MeasureAzimuth.ts': 'measurement/model/MeasureAzimuth.ts',
  'model/measurement/MeasureDistance.ts': 'measurement/model/MeasureDistance.ts',
  'model/measurement/MeasurePoint.ts': 'measurement/model/MeasurePoint.ts',
  'model/measurement/view.ts': 'measurement/model/view.ts',
  'model/measurement/viewForm.ts': 'measurement/model/viewForm.ts',
  'model/measurement/viewMap.ts': 'measurement/model/viewMap.ts',
  'model/measurement/viewMapMarker.ts': 'measurement/model/viewMapMarker.ts',
  'services/measurement.service.ts': 'measurement/measurement.service.ts',
  'services/measurement.service.spec.ts':
    'measurement/measurement.service.spec.ts',
  'types/measurement.ts': 'measurement/types.ts',
  'utils/measurement.ts': 'measurement/utils.ts',
  'utils/measurement.spec.ts': 'measurement/utils.spec.ts',

  // ---- print ----
  'services/print.service.ts': 'print/print.service.ts',
  'types/print.ts': 'print/types.ts',
  'utils/print.ts': 'print/utils.ts',

  // ---- legend ----
  'services/legend.service.ts': 'legend/legend.service.ts',
  'services/legend.service.spec.ts': 'legend/legend.service.spec.ts',
  'types/legend.ts': 'legend/types.ts',

  // ---- toolbar ----
  'types/toolbar.ts': 'toolbar/types.ts',

  // ---- menu ----
  'map-context-menu/actions.ts': 'menu/actions.ts',
  'map-context-menu/actions.spec.ts': 'menu/actions.spec.ts',
  'map-context-menu/add-geojson-here.ts': 'menu/add-geojson-here.ts',
  'map-context-menu/builder.ts': 'menu/builder.ts',
  'map-context-menu/builder.spec.ts': 'menu/builder.spec.ts',
  'map-context-menu/handle.ts': 'menu/handle.ts',
  'map-context-menu/handle.spec.ts': 'menu/handle.spec.ts',
  'map-context-menu/index.ts': 'menu/index.ts',
  'map-context-menu/items.ts': 'menu/items.ts',
  'map-context-menu/items.spec.ts': 'menu/items.spec.ts',
  'map-context-menu/types.ts': 'menu/types.ts',

  // ---- crs ----
  'types/crs.ts': 'crs/types.ts',
  'utils/crs-catalog.ts': 'crs/crs-catalog.ts',
  'utils/crs-catalog.spec.ts': 'crs/crs-catalog.spec.ts',
  'utils/proj4-crs-catalog.ts': 'crs/proj4-crs-catalog.ts',

  // ---- event ----
  'services/event-manager.service.ts': 'event/event-manager.service.ts',
  'services/event-manager.service.spec.ts':
    'event/event-manager.service.spec.ts',
  'model/Event.ts': 'event/model/Event.ts',
  'model/custom/EventBboxSelect.ts': 'event/model/EventBboxSelect.ts',
  'model/custom/EventClick.ts': 'event/model/EventClick.ts',
  'model/custom/EventContextMenu.ts': 'event/model/EventContextMenu.ts',
  'model/custom/index.ts': 'event/model/index.ts',
  'types/event.ts': 'event/types.ts',
  'utils/bbox-selector.ts': 'event/bbox-selector.ts',

  // ---- image ----
  'types/image.ts': 'image/types.ts',
  'utils/image.ts': 'image/utils.ts',
};

/** symbol -> new src-relative module (no extension) */
const homes = {
  // basemap
  BaseMapAdapter: 'basemap/adapter/BaseMapAdapter',
  DefaultBaseMapAdapter: 'basemap/adapter/DefaultBaseMapAdapter',
  getLowestLayerId: 'basemap/adapter/DefaultBaseMapAdapter',
  BaseMapLayer: 'basemap/model/BaseMapLayer',
  BASEMAP_PREFIX: 'basemap/model/BaseMapLayer',
  BasemapService: 'basemap/basemap.service',
  BasemapManager: 'basemap/basemap-manager.service',
  INIT_BASEMAPS: 'basemap/init',
  BasemapError: 'basemap/errors',
  BASEMAP_CONTROL_LOCALE: 'basemap/locale',
  BaseMapItem: 'basemap/types',
  BaseMapNoneItem: 'basemap/types',
  BaseMapRasterItem: 'basemap/types',
  BaseMapStore: 'basemap/types',
  BaseMapVectorItem: 'basemap/types',
  IBaseMapLayer: 'basemap/types',
  MittTypeBaseMap: 'basemap/types',
  MittTypeBaseMapEventKey: 'basemap/types',

  // measurement
  Measure: 'measurement/model/Measure',
  MeasureArea: 'measurement/model/MeasureArea',
  MeasureAzimuth: 'measurement/model/MeasureAzimuth',
  MeasureDistance: 'measurement/model/MeasureDistance',
  MeasurePoint: 'measurement/model/MeasurePoint',
  MeasurementHandle: 'measurement/model/handle',
  MeasurementHandleInstance: 'measurement/model/handle',
  View: 'measurement/model/view',
  FormView: 'measurement/model/viewForm',
  MapView: 'measurement/model/viewMap',
  MapMarkerView: 'measurement/model/viewMapMarker',
  addCursorCrosshair: 'measurement/model/cursor',
  removeCursorCrosshair: 'measurement/model/cursor',
  MeasurementService: 'measurement/measurement.service',
  IView: 'measurement/types',
  IViewProps: 'measurement/types',
  IViewSetting: 'measurement/types',
  IViewSettingField: 'measurement/types',
  MeasureActionItem: 'measurement/types',
  MeasurementHandleType: 'measurement/types',
  formatAreaText: 'measurement/utils',
  formatDistanceText: 'measurement/utils',
  MEASUREMENT_CONTROL_LOCALE: 'measurement/locale',

  // print
  PrintService: 'print/print.service',
  MapPrintStore: 'print/types',
  PrintOption: 'print/types',
  PrintOptions: 'print/types',
  createDefaultPrintStore: 'print/types',
  createPrintStoreApi: 'print/types',
  exportMapbox: 'print/utils',
  exportMapboxWithOptions: 'print/utils',
  getMapBoxCanvas: 'print/utils',
  waitMapLoadDone: 'print/utils',
  PRINT_CONTROL_LOCALE: 'print/locale',

  // legend
  LegendService: 'legend/legend.service',
  ExprHandlerFn: 'legend/types',
  ExprReturn: 'legend/types',
  LayerBranch: 'legend/types',
  LayerConfig: 'legend/types',
  LayerObjectKeys: 'legend/types',
  LegendElement: 'legend/types',
  LegendItem: 'legend/types',
  LegendLayerSpecification: 'legend/types',
  PropsLegendOption: 'legend/types',
  LEGEND_CONTROL_LOCALE: 'legend/locale',

  // toolbar
  AnyToolbarOptions: 'toolbar/types',
  AnyToolbarStrategy: 'toolbar/types',
  ControlStrategy: 'toolbar/types',
  MapControlButtonState: 'toolbar/types',
  MapControlButtonUIState: 'toolbar/types',
  ModuleStrategy: 'toolbar/types',
  Subscribable: 'toolbar/types',
  Toolbar: 'toolbar/types',
  ToolbarButtonConfig: 'toolbar/types',
  ToolbarModuleOptions: 'toolbar/types',
  ToolbarSingleOptions: 'toolbar/types',
  ToolbarStrategy: 'toolbar/types',
  ToolbarStrategyDef: 'toolbar/types',
  WithToolbar: 'toolbar/types',

  // crs
  CrsItem: 'crs/types',
  DEFAULT_CRS_ITEMS: 'crs/types',
  INITIAL_MAP_CRS_ITEMS: 'crs/types',
  MapCrsStore: 'crs/types',
  MittTypeMapCrs: 'crs/types',
  MittTypeMapCrsEventKey: 'crs/types',
  createDefaultCrsStore: 'crs/types',
  buildCrsSearchCatalog: 'crs/crs-catalog',
  buildMapCrsCatalog: 'crs/crs-catalog',
  formatCrsLabel: 'crs/crs-catalog',
  getCrsInputSuggestions: 'crs/crs-catalog',
  lookupCrsItem: 'crs/crs-catalog',
  normalizeEpsgCode: 'crs/crs-catalog',
  resolveCrsDisplayItems: 'crs/crs-catalog',
  resolveCrsItemForStore: 'crs/crs-catalog',
  resolveCrsProjection: 'crs/crs-catalog',
  searchCrsCatalog: 'crs/crs-catalog',
  WGS84_LONGLAT: 'crs/proj4-crs-catalog',
  ensureRegisteredProjection: 'crs/proj4-crs-catalog',
  lookupProj4CrsItem: 'crs/proj4-crs-catalog',
  CRS_CONTROL_LOCALE: 'crs/locale',

  // event
  EventManager: 'event/event-manager.service',
  normalizeEventFrom: 'event/event-manager.service',
  EventBboxRanger: 'event/model/EventBboxSelect',
  EventClick: 'event/model/EventClick',
  EventMouseMove: 'event/model/EventClick',
  EventContextMenu: 'event/model/EventContextMenu',
  EventRightClick: 'event/model/EventContextMenu',
  Event: 'event/model/Event',
  IEvent: 'event/model/Event',
  AnyIEvent: 'event/types',
  EventBboxRangerHandle: 'event/types',
  EventBboxRangerOption: 'event/types',
  EventClickOption: 'event/types',
  MapEventStore: 'event/types',
  MittTypeMapEvent: 'event/types',
  MittTypeMapEventEventKey: 'event/types',
  createDefaultEventStore: 'event/types',
  BoxRangerCallback: 'event/bbox-selector',
  BoxRangerHandle: 'event/bbox-selector',
  startBoxRangerMap: 'event/bbox-selector',
  EVENT_CONTROL_LOCALE: 'event/locale',

  // theme
  THEME_CONTROL_LOCALE: 'theme/locale',

  // image
  MapImageEntry: 'image/types',
  MapImageStore: 'image/types',
  createDefaultImageStore: 'image/types',
  ImageOptions: 'image/utils',
  addImageForMap: 'image/utils',
  loadImage: 'image/utils',
  styleImageToDataURL: 'image/utils',
  toImageDataFromRGBAImage: 'image/utils',
};

/** Aggregate barrels that lose members; imports from these get symbol-split. */
const SPLIT_BARRELS = new Set([
  'types/index.ts',
  'utils/index.ts',
  'services/index.ts',
  'model/index.ts',
  'errors/index.ts',
  'locale/index.ts',
]);

/** Files rewritten by hand afterwards — script must not touch them. */
const SKIP = new Set([
  'index.ts',
  'internal-barrel.ts',
  'public-api.spec.ts',
  'types/index.ts',
  'utils/index.ts',
  'services/index.ts',
  'model/index.ts',
  'locale/index.ts',
  'errors/index.ts',
  'legend/index.ts',
  'print/index.ts',
  'map-context-menu/index.ts',
]);

// ---------------------------------------------------------------------------

const allFiles = [];
(function walk(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p);
    else allFiles.push(path.relative(SRC, p).replace(/\\/g, '/'));
  }
})(SRC);

const existing = new Set(allFiles);

function resolveSpec(fromRel, spec) {
  if (!spec.startsWith('.')) return null;
  const base = path
    .join(path.dirname(fromRel), spec)
    .replace(/\\/g, '/')
    .replace(/^\.\//, '');
  for (const cand of [base, `${base}.ts`, `${base}/index.ts`]) {
    if (existing.has(cand)) return cand;
  }
  return null;
}

function newPathOf(rel) {
  return moves[rel] ?? rel;
}

function toSpec(fromNewRel, targetNewRel) {
  let target = targetNewRel.replace(/\.tsx?$/, '');
  let isIndex = false;
  if (target.endsWith('/index')) {
    target = target.slice(0, -'/index'.length);
    isIndex = true;
  }
  let rel = path
    .relative(path.dirname(fromNewRel), target)
    .replace(/\\/g, '/');
  if (rel === '') rel = isIndex ? '.' : './' + path.basename(target);
  if (!rel.startsWith('.')) rel = './' + rel;
  return rel;
}

const IMPORT_RE =
  /(?:^|\n)(\s*)(import|export)(\s+type)?\s*(\{[\s\S]*?\}|[^;'"\n]*?)\s*from\s*(['"])(\.[^'"]*)\5/g;

let changed = 0;
const report = [];

for (const rel of allFiles) {
  if (!rel.endsWith('.ts')) continue;
  const abs = path.join(SRC, rel);
  let content = fs.readFileSync(abs, 'utf8');
  const newRel = newPathOf(rel);

  if (!SKIP.has(rel)) {
    content = content.replace(
      IMPORT_RE,
      (full, ws, kw, typeKw, clause, q, spec) => {
        const targetOld = resolveSpec(rel, spec);
        if (!targetOld) {
          report.push(`UNRESOLVED ${rel}: ${spec}`);
          return full;
        }
        const targetNew = newPathOf(targetOld);
        const lead = full.startsWith('\n') ? '\n' : '';

        // Symbol split for aggregate barrels that lost members.
        if (
          SPLIT_BARRELS.has(targetOld) &&
          clause.trim().startsWith('{') &&
          kw === 'import'
        ) {
          const inner = clause.trim().slice(1, -1);
          const parts = inner
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean);
          const groups = new Map();
          for (const p of parts) {
            const bare = p.replace(/^type\s+/, '').split(/\s+as\s+/)[0].trim();
            const home = homes[bare];
            const key = home ?? '__keep__';
            if (!groups.has(key)) groups.set(key, []);
            groups.get(key).push(p);
          }
          if (groups.size === 1 && groups.has('__keep__')) {
            return `${lead}${ws}${kw}${typeKw ?? ''} ${clause.trim()} from ${q}${toSpec(newRel, targetNew)}${q}`;
          }
          const stmts = [];
          for (const [key, items] of groups) {
            const dest =
              key === '__keep__'
                ? toSpec(newRel, targetNew)
                : toSpec(newRel, key);
            stmts.push(
              `${kw}${typeKw ?? ''} { ${items.join(', ')} } from ${q}${dest}${q};`,
            );
          }
          return `${lead}${ws}${stmts.join(`\n${ws}`)}`.replace(/;$/, '');
        }

        return `${lead}${ws}${kw}${typeKw ?? ''} ${clause.trim()} from ${q}${toSpec(newRel, targetNew)}${q}`;
      },
    );
  }

  const absNew = path.join(SRC, newRel);
  if (newRel !== rel) {
    fs.mkdirSync(path.dirname(absNew), { recursive: true });
    fs.rmSync(abs);
    changed++;
  }
  fs.mkdirSync(path.dirname(absNew), { recursive: true });
  fs.writeFileSync(absNew, content);
}

// Remove now-empty directories.
for (const dir of ['adapter', 'map-context-menu', 'model/basemap', 'model/measurement', 'model/custom']) {
  const abs = path.join(SRC, dir);
  if (fs.existsSync(abs) && fs.readdirSync(abs).length === 0) fs.rmdirSync(abs);
}

console.log('moved:', changed);
if (report.length) console.log(report.join('\n'));
