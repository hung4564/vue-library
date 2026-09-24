import {
  formatCoordinate,
  type FormattedCoordinate,
} from '../utils/coordinate';
import { type CrsItem, INITIAL_MAP_CRS_ITEMS } from './types';

export type CoordinateFormatter = (
  coords: { longitude: number; latitude: number },
  isDMS?: boolean,
) => FormattedCoordinate;

/** Bind `formatCoordinate` to a CRS item (pure; no framework state). */
export function createCoordinateFormatter(crs: CrsItem): CoordinateFormatter {
  return (coords, isDMS = false) => formatCoordinate(coords, crs, isDMS);
}

/** Map UI (mouse coordinates, identify) always displays WGS 84. */
export function createMapDisplayCoordinateFormatter(): CoordinateFormatter {
  return createCoordinateFormatter(INITIAL_MAP_CRS_ITEMS[0]);
}
