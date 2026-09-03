import { bboxFromGeojson } from './libs/map-core/core/src/utils/fillBound.ts';

const point = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      properties: {},
      geometry: { type: 'Point', coordinates: [105, 10] },
    },
  ],
};
console.log('point', bboxFromGeojson(point as any));

const many = {
  type: 'FeatureCollection',
  features: Array.from({ length: 50000 }, (_, i) => ({
    type: 'Feature',
    properties: {},
    geometry: {
      type: 'Point',
      coordinates: [100 + i * 0.0001, 10 + i * 0.0001],
    },
  })),
};
console.log('many', bboxFromGeojson(many as any));

const poly = {
  type: 'Feature',
  properties: {},
  geometry: {
    type: 'Polygon',
    coordinates: [
      [
        [0, 0],
        [1, 0],
        [1, 1],
        [0, 1],
        [0, 0],
      ],
    ],
  },
};
console.log('poly', bboxFromGeojson(poly as any));
console.log('ok');
