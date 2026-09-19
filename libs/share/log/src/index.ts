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

export { Logger } from './Logger';
export { LoggerFactory } from './LoggerFactory';
export { ConsoleAdapter } from './adapters/ConsoleAdapter';
export { captureLogCaller, captureLogCallerSite } from './caller';
export type { LogCallerSite } from './caller';
export type {
  LogAdapter,
  LogContext,
  LogFlowKind,
  LogHeader,
  LogLevel,
  LogRecord,
} from './types';
