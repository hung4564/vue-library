import { LAYER_DETAIL_FIELD_LOCALE } from '../../detail/locale';

export const CREATE_CONTROL_SAMPLE_NONE = '— Select sample —';

export const LAYER_CONTROL_FIELD_LOCALE = {
  ...LAYER_DETAIL_FIELD_LOCALE,
  file: 'File',
  'layer-type': 'Layer type',
  'layer-name': 'Layer name',
  'style-type': 'Style type',
  'style-type-auto': 'Auto (from data)',
  'source-layer': 'Source layer',
  'source-layers': 'Source layers',
  crs: 'Coordinate reference system',
  'crs-placeholder': 'Search or enter EPSG code',
  'crs-hint': 'EPSG:4326 — WGS 84',
};

export const LAYER_CONTROL_CREATE_LOCALE = {
  title: 'New Layer',
  sample: 'Sample',
  'url-error': 'Failed to load from URL',
  'loading-url': 'Loading…',
  load: 'Load',
  cancel: 'Cancel',
  'layer-setting': 'Layer settings',
  'data-source': 'Data source',
  'tab-file': 'File',
  'tab-raw': 'Raw',
  'tab-url': 'URL',
  'paste-geojson': 'Paste GIS data',
  'paste-geojson-hint': 'GeoJSON, TopoJSON, KML, GPX, CSV, or WKT',
  'file-hint':
    'GeoJSON, KML, KMZ, GPX, TopoJSON, CSV, WKT, Shapefile, or .zip — drop files/folders, or paste GIS text / files (Ctrl+V)',
  'file-drop': 'Drop files here or click to browse',
  parsing: 'Reading file…',
  'parse-error': 'Could not read this file',
  'crs-mismatch':
    'File CRS differs from selected CRS; data will be reprojected.',
  'multi-file-error':
    'Drop one GIS file, a shapefile set (.shp + sidecars / .zip), or multiple GeoJSON/KML/GPX files.',
  creating: 'Creating layer…',
  'create-error': 'Failed to create layer',
  'create-error-data-too-large':
    'Data may be too large, too deeply nested, or circular. Try a smaller file or EPSG:4326.',
  'loaded-from-file': 'From file',
  'loaded-from-url': 'From URL',
  'loaded-from-paste': 'From paste',
  'clear-data': 'Clear',
  'replace-file': 'Replace file',
  'features-count': 'Features',
  'geometry-types': 'Geometry',
  'validation-name': 'Enter a layer name.',
  'validation-data': 'Load or paste GIS data first.',
  'validation-type': 'Choose a style type.',
  'validation-url': 'Enter a tile URL.',
  'validation-source-layers': 'Select at least one source layer.',
  'file-hint-mbtiles':
    'Drop a .mbtiles file (requires optional peer `sql.js`). Vector or raster is detected from metadata.',
  'file-hint-pmtiles':
    'Drop a .pmtiles file or paste a URL (requires optional peer `pmtiles`).',
  'file-hint-tilejson':
    'Paste a TileJSON URL (tiles.json) — vector layers are read from metadata.',
  'file-hint-filegdb':
    'Drop a `.gdb.zip` / `*_gdb.zip` or a `.gdb` folder (requires optional peer `gdal3.js`). Feature classes are merged into one layer.',
  'filegdb-choose-folder': 'Choose .gdb folder',
  'source-layers-hint': 'Choose which layers to add as sublayers.',
  'source-layers-all': 'Select all',
  'source-layers-none': 'Select none',
  'source-layer-geometry': 'Geometry',
  'source-layer-fields': 'Fields',
  'tile-kind-vector': 'Vector tiles',
  'tile-kind-raster': 'Raster tiles',
  'meta-format': 'Format',
  'meta-zoom': 'Zoom',
  'meta-layers': 'Layers',
  'meta-bounds': 'Bounds',
};

export const LAYER_CONTROL_TOGGLE_LOCALE = {
  hide: 'Hide layer',
  show: 'Show layer',
  'hide-all': 'Hide all layers',
  'show-all': 'Show all layers',
};

export const LAYER_CONTROL_LOCALE = {
  map: {
    'layer-control': {
      title: 'Layer Control',
      search: 'Search layers',
      'search-empty': 'No layers match',
      empty: 'No layers yet',
      'empty-hint': 'Create a layer to get started',
      'create-btn': 'Create Layer',
      toggle: LAYER_CONTROL_TOGGLE_LOCALE,
      create: LAYER_CONTROL_CREATE_LOCALE,
      field: LAYER_CONTROL_FIELD_LOCALE,
      info: { title: 'Info' },
      group: {
        rename: 'Rename group',
      },
    },
  },
};

export const CREATE_CONTROL_LOCALE = LAYER_CONTROL_LOCALE;
