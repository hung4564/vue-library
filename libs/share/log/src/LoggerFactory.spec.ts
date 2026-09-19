import { beforeEach, describe, expect, it } from 'vitest';
import { LoggerFactory } from './LoggerFactory';
import type { LogAdapter, LogRecord } from './types';

describe('LoggerFactory', () => {
  beforeEach(() => {
    LoggerFactory.resetInstanceForTests();
  });

  it('logger.with does not mutate parent namespaces', () => {
    const factory = LoggerFactory.getInstance();
    const records: LogRecord[] = [];
    factory.clearAdapters();
    factory.addAdapter({
      alwaysOn: true,
      log: (r) => records.push(r),
    });
    const log = factory.createLogger().setNamespace('base', 0);
    const child = log.with({ mapId: 'm', fn: 'child', span: 't' }, ['extra']);
    child.info('c');
    log.with({ fn: 'parent', span: 't' }).info('p');

    expect(records[0]?.header.namespaces).toEqual(['base', 'extra']);
    expect(records[0]?.header.mapId).toBe('m');
    expect(records[1]?.header.namespaces).toEqual(['base']);
    expect(records[1]?.header.mapId).toBeUndefined();
  });

  it('logger always stamps requestId', () => {
    const factory = LoggerFactory.getInstance();
    const records: LogRecord[] = [];
    factory.clearAdapters();
    factory.addAdapter({
      alwaysOn: true,
      log: (r) => records.push(r),
    });
    const log = factory.createLogger().setNamespace('test', 0);
    log.with({ fn: 'orphan', span: 't' }).info('orphan');
    expect(records[0]?.header.requestId).toBeTruthy();
  });

  it('logger.with requestId is used when provided', () => {
    const factory = LoggerFactory.getInstance();
    const records: LogRecord[] = [];
    factory.clearAdapters();
    factory.addAdapter({
      alwaysOn: true,
      log: (r) => records.push(r),
    } satisfies LogAdapter);
    const log = factory.createLogger().setNamespace('test', 0);
    log.with({ fn: 'a', span: 's', requestId: 'fixed-id' }).info('x');
    expect(records[0]?.header.requestId).toBe('fixed-id');
  });
});
