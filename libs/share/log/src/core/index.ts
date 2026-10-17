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
export { captureLogCallerSite } from './caller';
export type { LogCallerSite } from './caller';
export {
  getFlowParentFn,
  getFlowStackDepth,
  runWithFunctionLog,
} from './function-log';
export type { FunctionLogContext } from './function-log';
export { isLogEventPayload, packLogEvent, runWithLogEvent } from './log-event';
export type { LogEventPayload } from './log-event';
export { compactLogContext } from './log-zone-state';
export type { LogZoneState } from './log-zone-state';
export { Logger } from './Logger';
export { LoggerFactory, sanitizeHttpUrl } from './LoggerFactory';
export type { TrackRequestMeta } from './LoggerFactory';
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
  resolveMaybePromise,
  rootNamespace,
} from './store';
export type {
  IndexedDBLogDataStoreOptions,
  LogDataStore,
  LogFilterQuery,
  LogLevelFilter,
  MaybePromise,
  MemoryLogDataStoreApi,
  MemoryLogDataStoreOptions,
} from './store';
export type {
  LogAdapter,
  LogContext,
  LogFlowKind,
  LogHeader,
  LogLevel,
  LogOutcome,
  LogRecord,
} from './types';
export {
  resetZoneContextStorageForTests,
  useBrowserZoneStorageForTests,
} from './zone-context-storage';
export type { ZoneContextStorage } from './zone-context-storage';
