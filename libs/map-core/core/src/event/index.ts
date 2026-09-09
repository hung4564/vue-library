/**
 * Public entry for `@hungpvq/map-core/event`.
 * Named exports only — see libs/map-core/core/docs/core/stable-api.md.
 */
export { startBoxRangerMap } from './bbox-selector';
export { EventManager, normalizeEventFrom } from './event-manager.service';
export { EVENT_CONTROL_LOCALE } from './locale';
export { Event } from './model/Event';
export { EventBboxRanger } from './model/EventBboxSelect';
export { EventClick, EventMouseMove } from './model/EventClick';
export { EventContextMenu, EventRightClick } from './model/EventContextMenu';
export { createDefaultEventStore, MittTypeMapEventEventKey } from './types';

export type { BoxRangerCallback, BoxRangerHandle } from './bbox-selector';
export type { IEvent } from './model/Event';
export type {
  AnyIEvent,
  EventBboxRangerHandle,
  EventBboxRangerOption,
  EventClickOption,
  MapEventStore,
  MittTypeMapEvent,
} from './types';
