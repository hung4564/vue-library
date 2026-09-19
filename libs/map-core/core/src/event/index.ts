/**
 * Public entry for `@hungpvq/map-core/event`.
 * Named exports only — see libs/map-core/core/docs/core/stable-api.md.
 */
export { startBoxRangerMap } from './bbox-selector';
export { createEventActionSync } from './event-action-sync';
export type { EventActionSyncDeps } from './event-action-sync';
export { groupEventsByMapType, isEventActive } from './event-view';
export {
  EventManager,
  normalizeEventFrom,
} from './event-manager.service';
export { EVENT_CONTROL_LOCALE } from './locale';
export { logger } from './logger';
export { Event } from './model/Event';
export { EventBboxRanger } from './model/EventBboxRanger';
export { EventClick, EventMouseMove } from './model/EventClick';
export { EventContextMenu } from './model/EventContextMenu';
export { ensureMapEventStore } from './register-domain-store';
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
