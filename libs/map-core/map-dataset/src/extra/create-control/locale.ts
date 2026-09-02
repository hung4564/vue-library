/** Locale keys used by CreateControl (Vue + React). */
export const CREATE_CONTROL_SAMPLE_NONE = '— Select sample —';

export const CREATE_CONTROL_LOCALE = {
  map: {
    'layer-control': {
      'create-btn': 'Create Layer',
      create: {
        title: 'New Layer',
        sample: 'Sample',
        'sample-none': CREATE_CONTROL_SAMPLE_NONE,
        'sample-error': 'Failed to load sample',
        'loading-sample': 'Loading sample…',
        'layer-setting': 'Layer settings',
        'data-source': 'Data source',
        'tab-file': 'File',
        'tab-raw': 'Raw',
        'tab-sample': 'Sample',
        'paste-geojson': 'Paste GeoJSON',
        'paste-geojson-hint': '{ "type": "FeatureCollection", ... }',
        parsing: 'Parsing GeoJSON…',
        creating: 'Creating layer…',
        'create-error': 'Failed to create layer',
      },
      field: {
        'layer-type': 'Layer type',
        'layer-name': 'Layer name',
        'style-type': 'Style type',
        color: 'Color',
        crs: 'Coordinate reference system',
        'crs-placeholder': 'Search or enter EPSG code',
        'crs-hint': 'EPSG:4326 — WGS 84',
        url: 'Url',
        minzoom: 'Min zoom',
        maxzoom: 'Max zoom',
        bound: {
          minx: 'Min Longitude',
          miny: 'Min Latitude',
          maxx: 'Max Longitude',
          maxy: 'Max Latitude',
        },
      },
    },
  },
};
