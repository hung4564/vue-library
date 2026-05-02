import type { Emitter, EventType } from 'mitt';

/**
 * Framework-agnostic types are available directly from @hungpvq/map-core
 * This file only contains Vue-specific types
 */

export const MITT_KEY = 'mitt';

export type MittType<T extends Record<EventType, unknown>> = Emitter<T>;
