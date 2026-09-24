import { beforeEach, describe, expect, it } from 'vitest';

import { runWithFunctionLog } from './function-log';
import { packLogEvent, runWithLogEvent } from './log-event';
import { LoggerFactory } from './LoggerFactory';
import type { LogAdapter, LogRecord } from './types';
import { useBrowserZoneStorageForTests } from './zone-context-storage';

describe('LoggerFactory zone context', () => {
  beforeEach(() => {
    LoggerFactory.resetInstanceForTests();
  });

  it('runWithContext pushes and pops ambient context', async () => {
    const factory = LoggerFactory.getInstance();
    const records: LogRecord[] = [];
    factory.clearAdapters();
    factory.addAdapter({
      alwaysOn: true,
      log: (r) => records.push(r),
    });
    const log = factory.createLogger().setNamespace('test', 0);

    expect(factory.getContext()).toBeUndefined();

    await factory.runWithContext({ mapId: 'm1', span: 's1' }, async () => {
      expect(factory.getContext()?.mapId).toBe('m1');
      log.with({ fn: 'inside', span: 's1' }).info('inside');
    });

    expect(factory.getContext()).toBeUndefined();
    expect(records[0]?.header.mapId).toBe('m1');
    expect(records[0]?.header.span).toBe('s1');
    expect(records[0]?.id).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
    );
  });

  it('ensureActionContext reuses parent actionId', async () => {
    const factory = LoggerFactory.getInstance();
    const records: LogRecord[] = [];
    factory.clearAdapters();
    factory.addAdapter({
      alwaysOn: true,
      log: (r) => records.push(r),
    });
    const log = factory.createLogger().setNamespace('test', 0);

    await factory.ensureActionContext({ span: 'outer' }, async () => {
      const outerId = factory.getContext()?.actionId;
      expect(outerId).toBeTruthy();
      await factory.ensureActionContext({ span: 'inner' }, async () => {
        expect(factory.getContext()?.actionId).toBe(outerId);
        expect(factory.getContext()?.span).toBe('inner');
        log.with({ fn: 'nested', span: 'inner' }).info('nested');
      });
      log.with({ fn: 'outer', span: 'outer' }).info('outer');
    });

    expect(records).toHaveLength(2);
    expect(records[0]?.header.actionId).toBe(records[1]?.header.actionId);
  });

  it('keeps separate actionIds across concurrent async chains (Node ALS)', async () => {
    const factory = LoggerFactory.getInstance();
    const seen: string[] = [];

    await Promise.all([
      factory.runWithContext({ actionId: 'chain-a', span: 'a' }, async () => {
        await Promise.resolve();
        await Promise.resolve();
        seen.push(factory.getContext()?.actionId ?? '');
      }),
      factory.runWithContext({ actionId: 'chain-b', span: 'b' }, async () => {
        await Promise.resolve();
        seen.push(factory.getContext()?.actionId ?? '');
        await Promise.resolve();
        seen.push(factory.getContext()?.actionId ?? '');
      }),
    ]);

    expect(seen.filter((id) => id === 'chain-a').length).toBeGreaterThanOrEqual(
      1,
    );
    expect(seen.filter((id) => id === 'chain-b').length).toBeGreaterThanOrEqual(
      2,
    );
    expect(seen.every((id) => id === 'chain-a' || id === 'chain-b')).toBe(true);
  });

  it('ensureActionContext reuses explicit actionId when zone is empty', () => {
    const factory = LoggerFactory.getInstance();
    const seen: Array<string | undefined> = [];
    factory.ensureActionContext({ actionId: 'forced-act', span: 'x' }, () => {
      seen.push(factory.getContext()?.actionId);
    });
    expect(seen).toEqual(['forced-act']);
  });

  it('ensureActionContext prefers parent zone actionId over explicit', () => {
    const factory = LoggerFactory.getInstance();
    const seen: Array<string | undefined> = [];
    factory.ensureActionContext({ actionId: 'outer' }, () => {
      factory.ensureActionContext({ actionId: 'inner-ignored' }, () => {
        seen.push(factory.getContext()?.actionId);
      });
    });
    expect(seen).toEqual(['outer']);
  });

  it('nested runWithFunctionLog sets parentSpanId to parent spanId', () => {
    const factory = LoggerFactory.getInstance();
    const records: LogRecord[] = [];
    factory.clearAdapters();
    factory.addAdapter({
      alwaysOn: true,
      log: (r) => records.push(r),
    } satisfies LogAdapter);
    const log = factory.createLogger().setNamespace('test', 0);

    factory.ensureActionContext({ span: 'root' }, () => {
      runWithFunctionLog(log, { fn: 'outer', span: 'root' }, () => {
        runWithFunctionLog(log, { fn: 'inner', span: 'root' }, () => {
          log.with({ fn: 'inner', span: 'root' }).info('nested-mid');
        });
      });
    });

    const outerStart = records.find(
      (r) => r.args[0] === 'START' && r.header.fn === 'outer',
    );
    const innerStart = records.find(
      (r) => r.args[0] === 'START' && r.header.fn === 'inner',
    );
    expect(outerStart?.header.spanId).toBeTruthy();
    expect(outerStart?.header.parentSpanId).toBeUndefined();
    expect(innerStart?.header.parentSpanId).toBe(outerStart?.header.spanId);
    expect(innerStart?.header.actionId).toBe(outerStart?.header.actionId);

    const outerEnd = records.find(
      (r) => r.args[0] === 'END' && r.header.fn === 'outer',
    );
    expect(outerEnd?.header.durationMs).toBeTypeOf('number');
    expect(outerEnd?.header.outcome).toBe('ok');
  });

  it('hierarchical index nests under runWithFunctionLog', () => {
    const factory = LoggerFactory.getInstance();
    const records: LogRecord[] = [];
    factory.clearAdapters();
    factory.addAdapter({
      alwaysOn: true,
      log: (r) => records.push(r),
    } satisfies LogAdapter);
    const log = factory.createLogger().setNamespace('test', 0);

    factory.ensureActionContext({ span: 'root' }, () => {
      runWithFunctionLog(log, { fn: 'outer', span: 'root' }, () => {
        log.with({ fn: 'outer', span: 'root' }).info('mid');
        runWithFunctionLog(log, { fn: 'inner', span: 'root' }, () => {
          log.with({ fn: 'inner', span: 'root' }).info('nested-mid');
        });
        log.with({ fn: 'outer', span: 'root' }).info('after');
      });
    });

    const indexes = records.map((r) => r.header.index);
    expect(indexes[0]).toBe('1');
    expect(indexes[1]).toBe('1.1');
    expect(indexes[2]).toBe('1.2');
    expect(indexes[3]).toBe('1.2.1');
    expect(indexes[4]).toBe('1.3');
    expect(indexes[5]).toBe('1.4');
    expect(indexes[6]).toBe('2');
  });

  it('packLogEvent + runWithLogEvent restores zone after ambient pop', () => {
    const factory = LoggerFactory.getInstance();
    const packed = factory.runWithContext(
      { actionId: 'act-pack', span: 'menu.action', mapId: 'm1' },
      () => packLogEvent({ n: 1 }),
    );
    expect(factory.getContext()).toBeUndefined();

    let seen: string | undefined;
    runWithLogEvent(packed, (data) => {
      seen = factory.getContext()?.actionId;
      expect(data).toEqual({ n: 1 });
    });
    expect(seen).toBe('act-pack');
  });

  it('trackRequest mints HTTP requestId distinct from actionId', async () => {
    const factory = LoggerFactory.getInstance();
    const records: LogRecord[] = [];
    factory.clearAdapters();
    factory.addAdapter({
      alwaysOn: true,
      log: (r) => records.push(r),
    });

    let httpReq: string | undefined;
    let action: string | undefined;
    await factory.ensureActionContext({ span: 'menu.action' }, async () => {
      action = factory.getContext()?.actionId;
      await factory.trackRequest(
        { url: 'https://example.com/api?token=secret', method: 'GET' },
        async () => {
          await Promise.resolve();
          httpReq = factory.getContext()?.requestId;
          expect(factory.getContext()?.actionId).toBe(action);
          expect(factory.getContext()?.span).toBe('http.request');
          expect(factory.getContext()?.httpUrl).toBe('https://example.com/api');
          return { status: 200, ok: true };
        },
      );
    });

    expect(httpReq).toBeTruthy();
    expect(httpReq).not.toBe(action);
    const done = records.find((r) => r.args[0] === 'HTTP_DONE');
    expect(done?.header.requestId).toBe(httpReq);
    expect(done?.header.httpStatus).toBe(200);
    expect(done?.header.durationMs).toBeTypeOf('number');
    expect(done?.header.outcome).toBe('ok');
  });

  it('orphan logger mints actionId not HTTP requestId', () => {
    const factory = LoggerFactory.getInstance();
    const records: LogRecord[] = [];
    factory.clearAdapters();
    factory.addAdapter({
      alwaysOn: true,
      log: (r) => records.push(r),
    });
    const log = factory.createLogger().setNamespace('orphan', 0);
    log.info('outside');
    expect(records[0]?.header.actionId).toBeTruthy();
    expect(records[0]?.header.requestId).toBeUndefined();
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
    const child = log.with({ mapId: 'm', fn: 'c', span: 't' }, ['extra']);
    child.info('c');
    log.with({ fn: 'p', span: 't' }).info('p');

    expect(records[0]?.header.namespaces).toEqual(['base', 'extra']);
    expect(records[0]?.header.mapId).toBe('m');
    expect(records[1]?.header.namespaces).toEqual(['base']);
  });
});

describe('LoggerFactory browser zone (sticky)', () => {
  beforeEach(() => {
    LoggerFactory.resetInstanceForTests();
    useBrowserZoneStorageForTests();
  });

  it('keeps actionId after await', async () => {
    const factory = LoggerFactory.getInstance();
    let seen: string | undefined;
    await factory.ensureActionContext(
      { actionId: 'br-1', span: 'a' },
      async () => {
        await Promise.resolve();
        seen = factory.getContext()?.actionId;
      },
    );
    expect(seen).toBe('br-1');
  });

  it('keeps actionId after await handler (menu-shaped)', async () => {
    const factory = LoggerFactory.getInstance();
    const records: LogRecord[] = [];
    factory.clearAdapters();
    factory.addAdapter({
      alwaysOn: true,
      log: (r) => records.push(r),
    });
    const log = factory.createLogger().setNamespace('menu', 0);

    await factory.ensureActionContext(
      { actionId: 'br-menu', span: 'menu.action' },
      async () =>
        runWithFunctionLog(
          log,
          { fn: 'handleMenuAction', span: 'menu.action' },
          async () => {
            log
              .with({ fn: 'handleMenuActionClick', span: 'menu.action' })
              .debug('Context');
            const handler = async () => {
              await Promise.resolve();
              return 'ok';
            };
            await handler();
            log
              .with({ fn: 'handleMenuActionClick', span: 'menu.action' })
              .debug('Handler executed');
          },
        ),
    );

    const context = records.find((r) => r.args[0] === 'Context');
    const executed = records.find((r) => r.args[0] === 'Handler executed');
    const start = records.find((r) => r.args[0] === 'START');
    const end = records.find((r) => r.args[0] === 'END');
    expect(start?.header.actionId).toBe('br-menu');
    expect(context?.header.actionId).toBe('br-menu');
    expect(executed?.header.actionId).toBe('br-menu');
    expect(end?.header.actionId).toBe('br-menu');
  });

  it('nested ensureActionContext restores parent after inner await', async () => {
    const factory = LoggerFactory.getInstance();
    const seen: string[] = [];
    await factory.ensureActionContext(
      { actionId: 'br-outer', span: 'o' },
      async () => {
        await Promise.resolve();
        seen.push(factory.getContext()?.actionId ?? '');
        await factory.ensureActionContext({ span: 'inner' }, async () => {
          await Promise.resolve();
          seen.push(factory.getContext()?.actionId ?? '');
        });
        seen.push(factory.getContext()?.actionId ?? '');
      },
    );
    expect(seen).toEqual(['br-outer', 'br-outer', 'br-outer']);
  });
});
