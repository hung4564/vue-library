import mitt, { Emitter, EventType } from 'mitt';

export function createMapMitt<
  T extends Record<EventType, unknown> = Record<EventType, unknown>,
>(onAny?: (key: string | number | symbol, params: unknown) => void): Emitter<T> {
  const eventHandle = mitt<T>();
  if (onAny) {
    eventHandle.on('*', (key, params: unknown) => {
      onAny(key, params);
    });
  }
  return eventHandle;
}
