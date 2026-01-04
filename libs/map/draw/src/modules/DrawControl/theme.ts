import type { FilterSpecification, LayerSpecification } from 'maplibre-gl';

const DEFAULT_BLUE = '#3bb2d0';
const DEFAULT_ORANGE = '#fbb03b';
const DEFAULT_WHITE = '#fff';
type Layer = Omit<LayerSpecification, 'source'> & {
  filter?: FilterSpecification;
};
export const getDrawStyles = (
  primaryColor = DEFAULT_BLUE,
  activeColor = DEFAULT_ORANGE,
): Layer[] => [
  {
    id: 'gl-draw-polygon-fill',
    type: 'fill',
    filter: ['all', ['==', '$type', 'Polygon']],
    paint: {
      'fill-color': [
        'case',
        ['==', ['get', 'active'], 'true'],
        activeColor,
        primaryColor,
      ],
      'fill-opacity': 0.1,
    },
  },
  {
    id: 'gl-draw-lines-active',
    type: 'line',
    filter: [
      'all',
      ['any', ['==', '$type', 'LineString'], ['==', '$type', 'Polygon']],
      ['==', 'active', 'true'],
    ],
    layout: {
      'line-cap': 'round',
      'line-join': 'round',
    },
    paint: {
      'line-color': activeColor,
      'line-dasharray': [0.2, 2],
      'line-width': 2,
    },
  },
  {
    id: 'gl-draw-lines-inactive',
    type: 'line',
    filter: [
      'all',
      ['any', ['==', '$type', 'LineString'], ['==', '$type', 'Polygon']],
      ['!=', 'active', 'true'],
    ],
    layout: {
      'line-cap': 'round',
      'line-join': 'round',
    },
    paint: {
      'line-color': primaryColor,
      'line-dasharray': [2, 0],
      'line-width': 2,
    },
  },
  {
    id: 'gl-draw-point-outer',
    type: 'circle',
    filter: ['all', ['==', '$type', 'Point'], ['==', 'meta', 'feature']],
    paint: {
      'circle-radius': ['case', ['==', ['get', 'active'], 'true'], 7, 5],
      'circle-color': DEFAULT_WHITE,
    },
  },
  {
    id: 'gl-draw-point-inner',
    type: 'circle',
    filter: ['all', ['==', '$type', 'Point'], ['==', 'meta', 'feature']],
    paint: {
      'circle-radius': ['case', ['==', ['get', 'active'], 'true'], 5, 3],
      'circle-color': [
        'case',
        ['==', ['get', 'active'], 'true'],
        activeColor,
        primaryColor,
      ],
    },
  },
  {
    id: 'gl-draw-vertex-outer',
    type: 'circle',
    filter: [
      'all',
      ['==', '$type', 'Point'],
      ['==', 'meta', 'vertex'],
      ['!=', 'mode', 'simple_select'],
    ],
    paint: {
      'circle-radius': ['case', ['==', ['get', 'active'], 'true'], 7, 5],
      'circle-color': DEFAULT_WHITE,
    },
  },
  {
    id: 'gl-draw-vertex-inner',
    type: 'circle',
    filter: [
      'all',
      ['==', '$type', 'Point'],
      ['==', 'meta', 'vertex'],
      ['!=', 'mode', 'simple_select'],
    ],
    paint: {
      'circle-radius': ['case', ['==', ['get', 'active'], 'true'], 5, 3],
      'circle-color': activeColor,
    },
  },
  {
    id: 'gl-draw-midpoint',
    type: 'circle',
    filter: ['all', ['==', 'meta', 'midpoint']],
    paint: {
      'circle-radius': 3,
      'circle-color': activeColor,
    },
  },
];

export default getDrawStyles;
