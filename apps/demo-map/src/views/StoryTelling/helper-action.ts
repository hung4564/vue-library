export const createZoomAction = (center: [number, number], zoom: number) => ({
  type: 'zoomTo',
  payload: { center, zoom },
});

export const createPanAction = (center: [number, number]) => ({
  type: 'panTo',
  payload: { center },
});

export const createRotateAction = (angle: number) => ({
  type: 'rotateTo',
  payload: { angle },
});

export const createDrawRouteAction = (geojson: GeoJSON.FeatureCollection) => ({
  type: 'drawRoute',
  payload: { geojson },
});

export const createHighlightAction = (selector: string) => ({
  type: 'highlightElement',
  payload: { selector },
});
export const createOrbitAction = (
  center: [number, number],
  radius = 0.01,
  duration = 5000
) => ({
  type: 'orbitAround',
  payload: { center, radius, duration },
});
export const createCustomAction = (
  type: string,
  add?: () => void,
  remove?: () => void
) => ({
  type,
  custom: true,
  add,
  remove,
});
export const createOrbitCurrentCenterAction = (
  radius = 0.01,
  duration = 5000
) => ({
  type: 'orbitAroundCurrent',
  payload: { radius, duration },
});
