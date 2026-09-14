import type { MapSimple } from '@hungpvq/map-core';
import type { Feature } from 'geojson';
import type {
  HighlightEntry,
  HighlightPointerEvent,
  HighlightPresentation,
} from './types';

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

import { featureLngLatFromGeoJson } from './geometry';

export function featureLngLat(entry: HighlightEntry): [number, number] | undefined {
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
