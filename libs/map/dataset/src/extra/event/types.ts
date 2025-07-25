export interface WithEvent<EventMap extends Record<string, any> = any> {
  emit<K extends keyof EventMap>(event: K, data: EventMap[K]): void;
  on<K extends keyof EventMap>(
    event: K,
    callback: (data: EventMap[K]) => void,
  ): void;
  off<K extends keyof EventMap>(
    event: K,
    callback?: (data: EventMap[K]) => void,
  ): void;
}
