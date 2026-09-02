import type { Feature } from 'geojson';

export const DEMO_POLYGON: Feature = {
  type: 'Feature',
  properties: { id: '3' },
  geometry: {
    coordinates: [
      [
        [105.94753265070807, 20.636940420905717],
        [106.12125710970412, 20.636940420905717],
        [106.12125710970412, 20.719235591893252],
        [105.94753265070807, 20.719235591893252],
        [105.94753265070807, 20.636940420905717],
      ],
    ],
    type: 'Polygon',
  },
};

export const DEMO_BBOX: [number, number, number, number] = [
  105.94753265070807, 20.636940420905717, 106.12125710970412,
  20.719235591893252,
];

/** Compact bbox for dataset-list demos (northern Vietnam). */
export const DEMO_LIST_BBOX: [number, number, number, number] = [
  105.5, 20.5, 106.5, 21.5,
];

export const IDENTIFY_GROUP = {
  id: 'Group Identify',
  name: 'Group Identify',
} as const;

export const NO_GROUP_IDENTIFY = {
  id: 'No Group Identify',
  name: 'No Group Identify',
} as const;

export function demoPoint(
  coords: [number, number],
  properties: Record<string, unknown>,
): Feature {
  const id = properties.id;
  return {
    type: 'Feature',
    id: typeof id === 'string' || typeof id === 'number' ? id : undefined,
    properties,
    geometry: { type: 'Point', coordinates: coords },
  };
}

export function demoLine(
  coords: [number, number][],
  properties: Record<string, unknown>,
): Feature {
  const id = properties.id;
  return {
    type: 'Feature',
    id: typeof id === 'string' || typeof id === 'number' ? id : undefined,
    properties,
    geometry: { type: 'LineString', coordinates: coords },
  };
}

export function demoPolygon(
  coords: [number, number][][],
  properties: Record<string, unknown>,
): Feature {
  const id = properties.id;
  return {
    type: 'Feature',
    id: typeof id === 'string' || typeof id === 'number' ? id : undefined,
    properties,
    geometry: { type: 'Polygon', coordinates: coords },
  };
}
