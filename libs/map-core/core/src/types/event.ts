/**
 * Framework-agnostic event types
 */

import type { Coordinates, MapSimple } from './index';

/**
 * Options for click events
 */
export interface EventClickOption {
  classPointer?: string;
  [key: string]: unknown;
}

/**
 * Options for bounding box ranger events
 */
export type EventBboxRangerOption = EventClickOption;

/**
 * Callback handler for bounding box ranger events
 */
export type EventBboxRangerHandle = (
  _bbox?: [Coordinates, Coordinates],
) => void;

// IEvent is defined in model/Event.ts to avoid circular dependency
// Re-export it here for convenience
import type { IEvent } from '../model/Event';

/**
 * Event keys for Mitt event emitter
 */
export const MittTypeMapEventEventKey = {
  setCurrent: 'map:event:set-current',
  add: 'map:event:add',
  remove: 'map:event:remove',
  setItems: 'map:event:set-items',
} as const;

/**
 * Type helper for event emitter - accepts any IEvent regardless of callback type
 * This allows EventClick, EventBboxRanger, etc. to be used where IEvent is expected
 *
 * Note: Uses `any` instead of `unknown` to allow more specific event types
 * (like MapLayerMouseEvent) to be compatible through structural typing
 */
export type AnyIEvent = IEvent<Record<string, unknown>, (ev: any) => void>;

/**
 * Event types for Mitt event emitter
 */
export type MittTypeMapEvent = {
  [MittTypeMapEventEventKey.setCurrent]: AnyIEvent | undefined | null;
  [MittTypeMapEventEventKey.add]: AnyIEvent;
  [MittTypeMapEventEventKey.remove]: AnyIEvent;
  [MittTypeMapEventEventKey.setItems]: AnyIEvent[];
};
