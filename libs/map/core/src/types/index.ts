import type { Emitter, EventType } from 'mitt';

export * from './store';

export const MITT_KEY = 'mitt';

export type MittType<T extends Record<EventType, unknown>> = Emitter<T>;
