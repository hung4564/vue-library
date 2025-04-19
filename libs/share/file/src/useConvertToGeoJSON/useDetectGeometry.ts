export function getDepth(arr: any): number {
  return Array.isArray(arr) ? 1 + Math.max(0, ...arr.map(getDepth)) : 0;
}

export function useDetectGeometry() {
  const detectGeoType = (data: any): GeoJSON.Geometry['type'] => {
    if (data?.type && data?.coordinates) return data.type;
    const depth = getDepth(data);
    switch (depth) {
      case 1:
        return 'Point';
      case 2:
        return 'LineString';
      case 3:
        return 'Polygon';
      case 4:
        return 'MultiPolygon';
      default:
        throw new Error('Unsupported geometry depth');
    }
  };

  return { detectGeoType };
}
