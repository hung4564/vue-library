import type { LogZoneState } from './log-zone-state';
import { compactLogContext, snapshotZoneState } from './log-zone-state';
import { LoggerFactory } from './LoggerFactory';
import type { LogContext } from './types';

/**
 * Event / mitt payload that carries zone log context for async fan-out.
 */
export type LogEventPayload<T = unknown> = {
  log: LogContext;
  data: T;
  /** Continue hierarchical index after the boundary */
  indexPath?: number[];
};

export function isLogEventPayload(
  value: unknown,
): value is LogEventPayload<unknown> {
  return (
    value != null &&
    typeof value === 'object' &&
    'log' in value &&
    'data' in value &&
    typeof (value as LogEventPayload).log === 'object' &&
    (value as LogEventPayload).log != null
  );
}

/**
 * Snapshot current zone context and wrap `data` as `{ log, data, indexPath? }`.
 */
export function packLogEvent<T>(
  data: T,
  extra?: LogContext,
): LogEventPayload<T> {
  const factory = LoggerFactory.getInstance();
  const state = factory.getZoneState();
  const ambient = state?.context ?? {};
  const log = compactLogContext({ ...ambient, ...(extra ?? {}) });
  const snap = snapshotZoneState(state);
  return {
    log,
    data,
    indexPath: snap ? [...snap.indexPath] : undefined,
  };
}

/**
 * If `payload` is packed, run `fn(data)` inside the restored zone state.
 */
export function runWithLogEvent<T, R>(
  payload: LogEventPayload<T> | T,
  fn: (data: T) => R | Promise<R>,
): R | Promise<R> {
  if (isLogEventPayload(payload)) {
    const state: LogZoneState = {
      context: { ...payload.log },
      indexPath:
        payload.indexPath && payload.indexPath.length > 0
          ? [...payload.indexPath]
          : [0],
    };
    return LoggerFactory.getInstance().runWithZoneState(state, () =>
      fn(payload.data as T),
    );
  }
  return fn(payload as T);
}
