import {
  type LogContext,
  LoggerFactory,
  loggerFactory,
  runWithFunctionLog,
} from '@hungpvq/shared-log';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { createMapMitt } from './index';

describe('createMapMitt', () => {
  beforeEach(() => {
    LoggerFactory.resetInstanceForTests();
  });

  it('emits typed events to subscribers', () => {
    type Events = { ready: { id: string }; ping: undefined };
    const bus = createMapMitt<Events>();
    const onReady = vi.fn();
    bus.on('ready', onReady);
    bus.emit('ready', { id: 'm1' });
    expect(onReady).toHaveBeenCalledWith({ id: 'm1' });
  });

  it('restores log context for sync subscribers', () => {
    type Events = { go: { n: number } };
    const bus = createMapMitt<Events>();
    const seen: Array<string | undefined> = [];
    bus.on('go', () => {
      seen.push(loggerFactory.getContext()?.actionId);
    });

    loggerFactory.runWithContext({ actionId: 'req-a' }, () => {
      bus.emit('go', { n: 1 });
    });
    expect(seen).toEqual(['req-a']);
    expect(loggerFactory.getContext()).toBeUndefined();
  });

  it('stamps mapId from options when ambient context lacks it', () => {
    const bus = createMapMitt<{ ping: undefined }>({ mapId: 'map-x' });
    let seen: string | undefined;
    bus.on('ping', () => {
      seen = loggerFactory.getContext()?.mapId;
    });
    loggerFactory.runWithContext({ actionId: 'r2' }, () => {
      bus.emit('ping', undefined);
    });
    expect(seen).toBe('map-x');
  });

  it('off removes the original handler reference', () => {
    type Events = { go: number };
    const bus = createMapMitt<Events>();
    const handler = vi.fn();
    bus.on('go', handler);
    bus.off('go', handler);
    bus.emit('go', 1);
    expect(handler).not.toHaveBeenCalled();
  });

  it('keeps separate actionIds for concurrent emits', async () => {
    const bus = createMapMitt<{ tick: number }>();
    const seen: string[] = [];
    bus.on('tick', () => {
      seen.push(loggerFactory.getContext()?.actionId ?? '');
    });

    await Promise.all([
      loggerFactory.runWithContext({ actionId: 'a' }, async () => {
        await Promise.resolve();
        bus.emit('tick', 1);
      }),
      loggerFactory.runWithContext({ actionId: 'b' }, async () => {
        await Promise.resolve();
        bus.emit('tick', 2);
      }),
    ]);

    expect(seen).toContain('a');
    expect(seen).toContain('b');
  });

  it('packed emit carries actionId / spanId / parentSpanId', () => {
    type Events = { go: number };
    const bus = createMapMitt<Events>();
    let packedLog: LogContext | undefined;
    bus.on('go', () => {
      packedLog = { ...loggerFactory.getContext() };
    });

    const log = loggerFactory.createLogger().setNamespace('mitt-test', 0);
    loggerFactory.ensureActionContext({ span: 'root' }, () => {
      runWithFunctionLog(log, { fn: 'outer', span: 'root' }, () => {
        bus.emit('go', 1);
      });
    });

    expect(packedLog?.actionId).toBeTruthy();
    expect(packedLog?.spanId).toBeTruthy();
    expect(packedLog?.parentSpanId).toBeUndefined();
    // handler restores ambient from pack (outer frame span)
    expect(packedLog?.fn).toBe('outer');
  });
});
