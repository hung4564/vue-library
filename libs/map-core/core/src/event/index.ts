/**
 * Public entry for `@hungpvq/map-core/event`.
 * Named exports only — see libs/map-core/core/docs/core/stable-api.md.
 */
export type { BoxRangerCallback, BoxRangerHandle } from './bbox-selector';
export { startBoxRangerMap } from './bbox-selector';
export type { EventActionSyncDeps } from './event-action-sync';
export { createEventActionSync } from './event-action-sync';
export { EventManager, normalizeEventFrom } from './event-manager.service';
export { groupEventsByMapType, isEventActive } from './event-view';
export { EVENT_CONTROL_LOCALE } from './locale';
export { logger } from './logger';
export type { IEvent } from './model/Event';
export { Event } from './model/Event';
export { EventBboxRanger } from './model/EventBboxRanger';
export { EventClick, EventMouseMove } from './model/EventClick';
export { EventContextMenu } from './model/EventContextMenu';
export { ensureMapEventStore } from './register-domain-store';
export type {
  AnyIEvent,
  EventBboxRangerHandle,
  EventBboxRangerOption,
  EventClickOption,
  MapEventStore,
  MittTypeMapEvent,
} from './types';
export { createDefaultEventStore, MittTypeMapEventEventKey } from './types';
