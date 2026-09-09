import { LAYER_DETAIL_FIELD_LOCALE } from '../detail/locale';

export const CREATE_CONTROL_SAMPLE_NONE = '— Select sample —';

export const LAYER_CONTROL_FIELD_LOCALE = {
  ...LAYER_DETAIL_FIELD_LOCALE,
  file: 'File',
  'layer-type': 'Layer type',
  'layer-name': 'Layer name',
  'style-type': 'Style type',
  'style-type-auto': 'Auto (from data)',
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
    'GeoJSON, KML, KMZ, GPX, TopoJSON, CSV, WKT, Shapefile, or .zip',
  'file-drop': 'Drop files here or click to browse',
  parsing: 'Reading file…',
  'parse-error': 'Could not read this file',
  'crs-mismatch':
    'File CRS differs from selected CRS; data will be reprojected.',
  'multi-file-error':
    'Drop one GIS file, or a shapefile set (.shp + sidecars / .zip).',
  creating: 'Creating layer…',
  'create-error': 'Failed to create layer',
  'create-error-data-too-large':
    'Data may be too large, too deeply nested, or circular. Try a smaller file or EPSG:4326.',
  'loaded-title': 'Loaded data',
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
      info: { title: 'Info', export: 'Export', fillBound: 'Fit bounds' },
    },
  },
};

export const CREATE_CONTROL_LOCALE = LAYER_CONTROL_LOCALE;

export const LAYER_INFO_CONTROL_LOCALE = {
  map: {
    'layer-info-control': {
      title: 'Layer Info Control',
    },
  },
};
