import mitt, { Emitter, EventType } from 'mitt';

export function createMapMitt<
  T extends Record<EventType, unknown> = Record<EventType, unknown>,
>(): Emitter<T> {
  return mitt<T>();
}
