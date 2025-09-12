export interface WithEventHelper<Events extends Record<string, any> = any> {
  emit<K extends keyof Events>(event: K, data: Events[K]): void;
  on<K extends keyof Events>(
    event: K,
    callback: (data: Events[K]) => void,
  ): void;
  off<Key extends keyof Events>(
    type: Key,
    handler?: Handler<Events[Key]>,
  ): void;
}

export declare type Handler<T = unknown> = (event: T) => void;
