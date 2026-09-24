import { LoggerFactory } from './LoggerFactory';

/**
 * Always resolves the current singleton so `resetInstanceForTests()` works.
 */
export const loggerFactory: LoggerFactory = new Proxy({} as LoggerFactory, {
  get(_target, prop) {
    const inst = LoggerFactory.getInstance();
    const value = Reflect.get(inst, prop, inst);
    return typeof value === 'function' ? value.bind(inst) : value;
  },
  set(_target, prop, value) {
    const inst = LoggerFactory.getInstance();
    Reflect.set(inst, prop, value, inst);
    return true;
  },
});

export { ConsoleAdapter } from './adapters/ConsoleAdapter';
export type { LogCallerSite } from './caller';
export { captureLogCallerSite } from './caller';
export type { FunctionLogContext } from './function-log';
export {
  getFlowParentFn,
  getFlowStackDepth,
  runWithFunctionLog,
} from './function-log';
export type { LogEventPayload } from './log-event';
export { isLogEventPayload, packLogEvent, runWithLogEvent } from './log-event';
export type { LogZoneState } from './log-zone-state';
export { compactLogContext } from './log-zone-state';
export { Logger } from './Logger';
export type { TrackRequestMeta } from './LoggerFactory';
export { LoggerFactory } from './LoggerFactory';
export { sanitizeHttpUrl } from './LoggerFactory';
export type {
  IndexedDBLogDataStoreOptions,
  LogDataStore,
  LogFilterQuery,
  LogLevelFilter,
  MaybePromise,
  MemoryLogDataStoreApi,
  MemoryLogDataStoreOptions,
} from './store';
export {
  BaseLogDataStore,
  compareLogOrder,
  DataStoreLogAdapter,
  entryText,
  IndexedDBLogDataStore,
  logActionId,
  logMapId,
  logSpanId,
  MemoryLogDataStore,
  NoopLogDataStore,
  noopLogDataStore,
  rootNamespace,
} from './store';
export { resolveMaybePromise } from './store';
export type {
  LogAdapter,
  LogContext,
  LogFlowKind,
  LogHeader,
  LogLevel,
  LogOutcome,
  LogRecord,
} from './types';
export type { ZoneContextStorage } from './zone-context-storage';
export {
  resetZoneContextStorageForTests,
  useBrowserZoneStorageForTests,
} from './zone-context-storage';
