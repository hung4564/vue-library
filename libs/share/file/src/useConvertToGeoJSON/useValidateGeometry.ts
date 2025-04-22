import {
  isCoord,
  isCoord2DArray,
  isCoord3DArray,
  isCoordArray,
} from './guards';

export function useValidateGeometry() {
  const validateGeometry = (geometry: GeoJSON.Geometry): boolean => {
    if (geometry.type === 'GeometryCollection') {
      return geometry.geometries.every(validateGeometry);
    }

    const coords = geometry.coordinates;

    switch (geometry.type) {
      case 'Point':
        return isCoord(coords);
      case 'MultiPoint':
      case 'LineString':
        return isCoordArray(coords);
      case 'Polygon':
      case 'MultiLineString':
        return isCoord2DArray(coords);
      case 'MultiPolygon':
        return isCoord3DArray(coords);
      default:
        return false;
    }
  };

  return { validateGeometry };
}
