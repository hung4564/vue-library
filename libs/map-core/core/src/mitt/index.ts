import {
  getFlowParentFn,
  getFlowStackDepth,
  loggerFactory,
  packLogEvent,
  runWithLogEvent,
  type LogContext,
  type LogEventPayload,
} from '@hungpvq/shared-log';
import mitt, { Emitter, EventType, Handler, WildcardHandler } from 'mitt';
import {
  ensureMapDomainStore,
  registerMapDomainStoreFactory,
} from '../store/map-domain-store';
import { MAP_STORE_KEY } from '../types/constants';
import { logHelper } from '../utils/log';

const mittLogger = () =>
  loggerFactory.createLogger().setNamespace('map:mitt', 2);

export type CreateMapMittOptions = {
  /** Stamped into emitted context when ambient context has no `mapId`. */
  mapId?: string;
};

type RawEvents = Record<EventType, unknown>;

/**
 * Map event bus. Packs zone log context onto the wire as `{ log, data }`,
 * logs a single EMIT (no START/END), and restores context for subscribers.
 */
export function createMapMitt<
  T extends Record<EventType, unknown> = Record<EventType, unknown>,
>(options?: CreateMapMittOptions): Emitter<T> {
  const raw = mitt<RawEvents>();
  const wrappers = new Map<
    Handler<T[keyof T]> | WildcardHandler<T>,
    Handler<unknown> | WildcardHandler<RawEvents>
  >();

  const resolveMapId = (ctx?: LogContext) =>
    options?.mapId ?? ctx?.mapId ?? 'global';

  const wrapHandler = (
    handler: Handler<T[keyof T]>,
  ): Handler<unknown> => {
    let wrapped = wrappers.get(handler) as Handler<unknown> | undefined;
    if (!wrapped) {
      wrapped = (event: unknown) => {
        // Restore packed zone only — no runWithFunctionLog START/END.
        runWithLogEvent(
          event as LogEventPayload<T[keyof T]> | T[keyof T],
          (data) => handler(data),
        );
      };
      wrappers.set(handler, wrapped);
      wrappers.set(wrapped as Handler<T[keyof T]>, wrapped);
    }
    return wrapped;
  };

  const wrapWildcard = (
    handler: WildcardHandler<T>,
  ): WildcardHandler<RawEvents> => {
    let wrapped = wrappers.get(handler) as
      | WildcardHandler<RawEvents>
      | undefined;
    if (!wrapped) {
      wrapped = (type, event) => {
        runWithLogEvent(event as LogEventPayload<unknown> | unknown, (data) =>
          handler(type as keyof T, data as T[keyof T]),
        );
      };
      wrappers.set(handler, wrapped);
      wrappers.set(wrapped as unknown as WildcardHandler<T>, wrapped);
    }
    return wrapped;
  };

  const runEmit = (type: keyof T, event: T[keyof T] | undefined) => {
    const eventName = String(type);
    const extra: LogContext = {
      eventName,
      flowKind: 'emit',
    };
    if (options?.mapId) extra.mapId = options.mapId;
    const packed = packLogEvent(event as T[keyof T], extra);
    const mapId = resolveMapId(packed.log);
    logHelper(mittLogger(), mapId, 'mitt')
      .with({
        fn: 'mitt.emit',
        span: 'mitt.emit',
        flowKind: 'emit',
        eventName,
        flowDepth: getFlowStackDepth(),
        parentFn: getFlowParentFn() ?? packed.log.fn,
        mapId: options?.mapId ?? packed.log.mapId,
      })
      .debug(`EMIT ${eventName}`);
    raw.emit(type as EventType, packed);
  };

  const on: Emitter<T>['on'] = ((
    type: keyof T | '*',
    handler: Handler<T[keyof T]> | WildcardHandler<T>,
  ) => {
    if (type === '*') {
      raw.on('*', wrapWildcard(handler as WildcardHandler<T>));
      return;
    }
    raw.on(
      type as EventType,
      wrapHandler(handler as Handler<T[keyof T]>),
    );
  }) as Emitter<T>['on'];

  const off: Emitter<T>['off'] = ((
    type: keyof T | '*',
    handler?: Handler<T[keyof T]> | WildcardHandler<T>,
  ) => {
    if (!handler) {
      raw.off(type as EventType);
      return;
    }
    const wrapped =
      wrappers.get(handler as Handler<T[keyof T]> | WildcardHandler<T>) ??
      (handler as Handler<unknown> | WildcardHandler<RawEvents>);
    if (type === '*') {
      raw.off('*', wrapped as WildcardHandler<RawEvents>);
      return;
    }
    raw.off(type as EventType, wrapped as Handler<unknown>);
  }) as Emitter<T>['off'];

  const emit: Emitter<T>['emit'] = ((
    type: keyof T,
    event?: T[keyof T],
  ) => {
    const parent = loggerFactory.getContext();
    const mapId = options?.mapId;
    const run = () => runEmit(type, event);

    if (parent?.actionId) {
      const seed: LogContext = {};
      if (mapId && !parent.mapId) seed.mapId = mapId;
      loggerFactory.ensureActionContext(seed, run);
      return;
    }

    const seed: LogContext = { span: 'mitt.emit' };
    if (mapId) seed.mapId = mapId;
    loggerFactory.ensureActionContext(seed, run);
  }) as Emitter<T>['emit'];

  return {
    get all() {
      return raw.all as Emitter<T>['all'];
    },
    on,
    off,
    emit,
  };
}

registerMapDomainStoreFactory(MAP_STORE_KEY.MITT, {
  create: (mapId) => createMapMitt({ mapId }),
});

/** Get or create the map mitt emitter (framework-agnostic). */
export function ensureMapMitt<
  T extends Record<EventType, unknown> = Record<EventType, unknown>,
>(mapId: string): Emitter<T> {
  return ensureMapDomainStore<Emitter<T>>(mapId, MAP_STORE_KEY.MITT);
}
