import type { FilterSpecification, LayerSpecification } from 'maplibre-gl';

const blue = '#3bb2d0';
const orange = '#fbb03b';
const white = '#fff';
type Layer = Omit<LayerSpecification, 'source'> & {
  filter?: FilterSpecification;
};
const layers: Layer[] = [
  {
    id: 'gl-draw-polygon-fill',
    type: 'fill',
    filter: ['all', ['==', '$type', 'Polygon']],
    paint: {
      'fill-color': ['case', ['==', ['get', 'active'], 'true'], orange, blue],
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
      'line-color': orange,
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
      'line-color': blue,
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
      'circle-color': white,
    },
  },
  {
    id: 'gl-draw-point-inner',
    type: 'circle',
    filter: ['all', ['==', '$type', 'Point'], ['==', 'meta', 'feature']],
    paint: {
      'circle-radius': ['case', ['==', ['get', 'active'], 'true'], 5, 3],
      'circle-color': ['case', ['==', ['get', 'active'], 'true'], orange, blue],
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
      'circle-color': white,
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
      'circle-color': orange,
    },
  },
  {
    id: 'gl-draw-midpoint',
    type: 'circle',
    filter: ['all', ['==', 'meta', 'midpoint']],
    paint: {
      'circle-radius': 3,
      'circle-color': orange,
    },
  },
];

export default layers;
