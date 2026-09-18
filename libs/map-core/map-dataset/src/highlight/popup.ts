import type { MapSimple } from '@hungpvq/map-core';
import type { Feature, FeatureCollection, Geometry } from 'geojson';
import type {
  HighlightEntry,
  HighlightGeoJson,
  HighlightPointerEvent,
  HighlightPresentation,
} from './types';

/** First coordinate of a geometry (Point, or first vertex of line/polygon/multi*). */
export function firstCoordinate(
  geometry: Geometry | null | undefined,
): [number, number] | undefined {
  if (!geometry) return undefined;
  switch (geometry.type) {
    case 'Point':
      return geometry.coordinates as [number, number];
    case 'MultiPoint':
    case 'LineString':
      return geometry.coordinates[0] as [number, number] | undefined;
    case 'MultiLineString':
    case 'Polygon':
      return geometry.coordinates[0]?.[0] as [number, number] | undefined;
    case 'MultiPolygon':
      return geometry.coordinates[0]?.[0]?.[0] as [number, number] | undefined;
    default:
      return undefined;
  }
}

export function featureLngLatFromGeoJson(
  geojson: HighlightGeoJson,
): [number, number] | undefined {
  if (geojson.type === 'FeatureCollection') {
    const first = geojson.features[0];
    return first ? firstCoordinate(first.geometry) : undefined;
  }
  return firstCoordinate((geojson as Feature).geometry);
}

/** Point-only FC for marker mode — non-points become Point at first vertex. */
export function markerCentroidCollection(
  fc: FeatureCollection,
): FeatureCollection {
  const features: Feature[] = [];
  for (const f of fc.features) {
    const g = f.geometry;
    if (!g) continue;
    if (g.type === 'Point') {
      features.push(f);
      continue;
    }
    const coords = firstCoordinate(g);
    if (!coords) continue;
    features.push({
      type: 'Feature',
      id: f.id,
      properties: { ...f.properties, is_marker: true },
      geometry: { type: 'Point', coordinates: coords },
    });
  }
  return { type: 'FeatureCollection', features };
}

export function entryAsFeature(entry: HighlightEntry): Feature {
  if (entry.feature.type === 'FeatureCollection') {
    return (
      entry.feature.features[0] ?? {
        type: 'Feature',
        properties: {},
        geometry: { type: 'Point', coordinates: [0, 0] },
      }
    );
  }
  return entry.feature;
}

export function pointerEventFromEntry(
  entry: HighlightEntry,
): HighlightPointerEvent | undefined {
  if (!entry.pointerLngLat) return undefined;
  return {
    lngLat: entry.pointerLngLat,
    point: entry.pointerPoint,
    type: entry.pointerEventType,
  };
}

export function featureLngLat(
  entry: HighlightEntry,
): [number, number] | undefined {
  return featureLngLatFromGeoJson(entryAsFeature(entry));
}

/** Resolve MapLibre popup lng/lat from presentation.popup.position. */
export function resolvePopupLngLat(
  entry: HighlightEntry,
  presentation: HighlightPresentation,
  map: MapSimple,
): [number, number] | undefined {
  const popupOpt = presentation.popup;
  const position =
    popupOpt === true || typeof popupOpt !== 'object'
      ? 'pointer'
      : (popupOpt.position ?? 'pointer');

  if (typeof position === 'function') {
    const resolved = position(
      entryAsFeature(entry),
      pointerEventFromEntry(entry),
      {
        map,
        entry,
      },
    );
    return resolved ?? featureLngLat(entry);
  }
  if (Array.isArray(position)) return position;
  if (position === 'pointer' && entry.pointerLngLat) {
    return entry.pointerLngLat;
  }
  return featureLngLat(entry);
}
