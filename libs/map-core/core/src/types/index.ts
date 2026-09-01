/**
 * Framework-agnostic types for map core
 */

/**
 * Map control position type
 */
export type Position =
  'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';

/**
 * Base interface for map-related props
 */
export interface WithMapPropType {
  mapId?: string;
  dragId?: string;
  btnWidth?: number;
  position?: Position;
  controlVisible?: boolean;
  controlOrder?: number | string;
  controlLayout?: 'standalone' | 'toolbar';
  top?: number;
  bottom?: number;
  left?: number;
  right?: number;
}
import type { Feature, FeatureCollection, Geometry } from 'geojson';
import type { FilterSpecification, Map } from 'maplibre-gl';

/**
 * Map instance type with id
 */
export type MapSimple = Map & {
  id: string;
};

/**
 * Map callback function type
 * Called when map instance is available
 */
export type MapFCOnUseMap<T = void> = (map: MapSimple) => T;

/**
 * Color type
 */
type RGB = `rgb(${number}, ${number}, ${number})`;
type RGBA = `rgba(${number}, ${number}, ${number}, ${number})`;
type HEX = `#${string}`;

export type Color = RGB | RGBA | HEX | string;

/**
 * Coordinates type
 */
export type Coordinates = {
  x: number;
  y: number;
};

/**
 * Coordinates number type (tuple)
 */
export type CoordinatesNumber = [number, number];

/**
 * Re-export GeoJSON types
 */
export type { Feature, FeatureCollection, FilterSpecification, Geometry };

/**
 * Re-export event types
 */
export * from './event';

/**
 * Re-export constants
 */
export * from './constants';

/**
 * Re-export compare types
 */
export * from './compare';

/**
 * Re-export CRS types
 */
export * from './crs';

/**
 * Re-export language types
 */
export * from './lang';

/**
 * Re-export toolbar types
 */
export * from './toolbar';

/**
 * Re-export store types
 */
export * from './store';

/**
 * Re-export basemap types
 */
export * from './basemap';

/**
 * Re-export measurement types
 */
export * from './measurement';

/**
 * Re-export print types
 */
export * from './print';

/**
 * Re-export legend types
 */
export * from './legend';

/**
 * Re-export image types
 */
export * from './image';
