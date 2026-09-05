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
  'layer-setting': 'Layer settings',
  'data-source': 'Data source',
  'tab-file': 'File',
  'tab-raw': 'Raw',
  'tab-url': 'URL',
  'paste-geojson': 'Paste GIS data',
  'paste-geojson-hint': 'GeoJSON, TopoJSON, KML, GPX, CSV, or WKT',
  'file-hint': 'GeoJSON, KML, KMZ, GPX, TopoJSON, CSV, WKT, Shapefile, or .zip (GeoJSON/KML/… or Shapefile)',
  parsing: 'Reading file…',
  'parse-error': 'Could not read this file',
  creating: 'Creating layer…',
  'create-error': 'Failed to create layer',
  'create-error-data-too-large':
    'Data may be too large, too deeply nested, or circular. Try a smaller file or EPSG:4326.',
};

export const LAYER_CONTROL_LOCALE = {
  map: {
    'layer-control': {
      title: 'Layer Control',
      empty: 'No layers yet',
      'empty-hint': 'Create a layer to get started',
      'create-btn': 'Create Layer',
      create: LAYER_CONTROL_CREATE_LOCALE,
      field: LAYER_CONTROL_FIELD_LOCALE,
      info: { title: 'Info' },
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
