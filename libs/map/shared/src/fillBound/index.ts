import { EaseToOptions, LngLatBoundsLike, PaddingOptions } from 'maplibre-gl';

import { bbox, lineString, point, polygon } from '@turf/turf';
import { BBox } from 'geojson';
import {
  CoordinatesNumber,
  Feature,
  FeatureCollection,
  Geometry,
  MapSimple,
} from '../types';

type FitBoundsValue =
  | Geometry
  | Feature
  | FeatureCollection
  | LngLatBoundsLike
  | BBox
  | undefined
  | null;

export function fitBounds(
  map: MapSimple,
  value: FitBoundsValue,
  { zoom = 15 } = {},
) {
  if (!value || !map) return;
  const padding: PaddingOptions = {
    top: 50,
    bottom: 50,
    left: 50,
    right: 50,
  };

  if (
    typeof value === 'object' &&
    'type' in value &&
    (value as any).type === 'Point'
  ) {
    map.easeTo({
      center: (value as any).coordinates,
      zoom,
      duration: 0,
      padding,
    } as EaseToOptions);
    return;
  }

  let bboxFil: LngLatBoundsLike | undefined = undefined;
  if (Array.isArray(value)) {
    if (value.length === 2 || value.length === 4) {
      bboxFil = value as LngLatBoundsLike;
    } else if (value.length === 6) {
      bboxFil = [value[0], value[1], value[3], value[4]] as LngLatBoundsLike;
    } else {
      bboxFil = getBBox(
        value as unknown as Geometry | Feature | FeatureCollection,
      );
    }
  } else {
    bboxFil = getBBox(value as Geometry | Feature | FeatureCollection);
  }

  if (!bboxFil) return;

  map.fitBounds(bboxFil, {
    padding,
    duration: 100,
  });
}

function getBBox(
  feature: Geometry | Feature | FeatureCollection,
): LngLatBoundsLike | undefined {
  if (!feature || !('type' in feature)) return;
  let bboxFil: any = undefined;
  if (feature.type === 'Feature' || feature.type === 'FeatureCollection') {
    bboxFil = bbox(feature);
  } else {
    bboxFil = bbox({
      type: 'Feature',
      properties: {},
      geometry: feature,
    });
  }
  return bboxFil as LngLatBoundsLike;
}

export function convertGeometry(
  coordinates: CoordinatesNumber[],
  properties: Record<string, any> = {},
) {
  if (coordinates.length === 0) {
    return;
  }
  if (coordinates.length === 1) {
    return point(coordinates[0], properties);
  }
  if (coordinates.length === 2) {
    return lineString(coordinates, properties);
  }
  return polygon([[...coordinates, coordinates[0]]], properties);
}
