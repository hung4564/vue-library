/**
 * Pure helpers for MeasurementSetting field-geometry download / fly-to
 * (Vue ↔ React parity). Hosts still call file-saver `saveAs` with the blob.
 */

import type { Feature, Position } from 'geojson';
import type {
  CoordinatesNumber,
  DraftCoordinatesNumber,
} from '../types';

function toPointFeature(coordinates: Position): Feature {
  return {
    type: 'Feature',
    properties: {},
    geometry: { type: 'Point', coordinates },
  };
}

function toLineStringFeature(coordinates: Position[]): Feature {
  return {
    type: 'Feature',
    properties: {},
    geometry: { type: 'LineString', coordinates },
  };
}

function toPolygonFeature(coordinates: Position[][]): Feature {
  return {
    type: 'Feature',
    properties: {},
    geometry: { type: 'Polygon', coordinates },
  };
}

/**
 * Point (1) / LineString (2) / closed Polygon (3+) from draft coordinates.
 * Skips null draft slots; returns undefined when no valid pair remains.
 */
export function draftCoordinatesToFeature(
  coordinates: DraftCoordinatesNumber[],
): Feature | undefined {
  const validCoords = coordinates.filter(
    (c): c is CoordinatesNumber => c[0] !== null && c[1] !== null,
  );
  if (!validCoords.length) return undefined;
  if (validCoords.length === 1) return toPointFeature(validCoords[0]);
  if (validCoords.length === 2) return toLineStringFeature(validCoords);
  return toPolygonFeature([[...validCoords, validCoords[0]]]);
}

export type MeasurementGeojsonDownload = {
  blob: Blob;
  fileName: string;
};

/**
 * Build a FeatureCollection blob for measurement coordinate download.
 * Returns undefined when there is no downloadable geometry.
 */
export function buildMeasurementGeojsonDownload(
  coordinates: DraftCoordinatesNumber[],
  fileName = 'geojson.json',
): MeasurementGeojsonDownload | undefined {
  const geom = draftCoordinatesToFeature(coordinates);
  if (!geom) return undefined;
  const geojson = {
    type: 'FeatureCollection',
    features: [geom],
  };
  const blob = new Blob([JSON.stringify(geojson)], {
    type: 'text/plain;charset=utf-8',
  });
  return { blob, fileName };
}
