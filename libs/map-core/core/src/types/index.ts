/**
 * Framework-agnostic types for map core
 */

/**
 * Map control position type
 */
export type Position =
  'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';

/**
 * How a control button is placed: corner (`standalone`), shared toolbar,
 * or always a corner button (`button`, not auto-promoted on mobile).
 */
export type ControlLayout = 'standalone' | 'toolbar' | 'button';

/**
 * Map `buttonInMobile` (viewports ≤640px):
 * - `button` — leave corner buttons unchanged
 * - `toolbar` — move supporting buttons into `ToolbarControl`
 * - `menu` — keep corner groups, cap expand at 1/2×1/2 of the map, overflow in a More menu
 */
export type ButtonInMobile = 'button' | 'toolbar' | 'menu';


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
  controlLayout?: ControlLayout;
  /** Control id for ModuleContainer btn class (`{controlId}-btn-module-container`) */
  controlId?: string;
}
import type { Feature, FeatureCollection, Geometry } from 'geojson';
import type { FilterSpecification, Map } from 'maplibre-gl';

/**
 * Map instance type with id
 */
export type MapSimple = Map & {
  id: string;
};

/** Internal helpers — not re-exported from the package root. */
export type { Feature, FeatureCollection, FilterSpecification, Geometry };

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

/** Draft point in the measurement form; empty rows are `[null, null]`. */
export type DraftCoordinatesNumber = CoordinatesNumber | [null, null];

/**
 * Re-export constants
 */
export * from './constants';

/**
 * Re-export language types
 */
export * from './lang';

/**
 * Re-export store types
 */
export * from './store';
