import { isInputFeature } from './guards';
import { useDetectGeometry } from './useDetectGeometry';
import { useValidateGeometry } from './useValidateGeometry';

export function useConvertToGeoJSON() {
  const { detectGeoType } = useDetectGeometry();
  const { validateGeometry } = useValidateGeometry();

  const convertFeature = (input: any): GeoJSON.Feature => {
    if (!isInputFeature(input)) {
      throw new Error('Invalid input: not an InputFeature');
    }
    if (input.type == 'Feature' && input.geometry) {
      return input as GeoJSON.Feature;
    }
    const { geometry, ...properties } = input;

    const geo: GeoJSON.Geometry =
      geometry?.type && geometry?.coordinates
        ? geometry
        : { type: detectGeoType(geometry), coordinates: geometry };

    if (!validateGeometry(geo)) {
      throw new Error('Invalid geometry');
    }

    return {
      type: 'Feature',
      geometry: geo,
      properties,
    };
  };

  const convertList = (list: any[]): GeoJSON.FeatureCollection => ({
    type: 'FeatureCollection',
    features: list.map(convertFeature),
  });

  return { convertFeature, convertList };
}
