/**
 * Framework-agnostic @hungpvq/shared-log scenarios (no MapLibre / map packages).
 * Used by demo-map `#/shared-log` (Vue + React).
 */
import {
  loggerFactory,
  runWithFunctionLog,
  type LogRecord,
} from '@hungpvq/shared-log';

export type SharedLogScenarioId =
  | 'sync-action'
  | 'nested-spans'
  | 'track-request'
  | 'orphan'
  | 'abort'
  | 'error'
  | 'concurrent';

export const SHARED_LOG_SCENARIOS: ReadonlyArray<{
  id: SharedLogScenarioId;
  label: string;
  expect: string;
}> = [
  {
    id: 'sync-action',
    label: '1. ensureActionContext',
    expect: 'One actionId; indexes 1…',
  },
  {
    id: 'nested-spans',
    label: '2. Nested runWithFunctionLog',
    expect: 'Child parentSpanId === parent spanId',
  },
  {
    id: 'track-request',
    label: '3. trackRequest (HTTP)',
    expect: 'HTTP requestId ≠ actionId',
  },
  {
    id: 'orphan',
    label: '4. Log outside zone',
    expect: 'Mints orphan actionId',
  },
  {
    id: 'abort',
    label: '5. AbortError',
    expect: 'outcome: abort',
  },
  {
    id: 'error',
    label: '6. Throw error',
    expect: 'ERROR + outcome: error',
  },
  {
    id: 'concurrent',
    label: '7. Concurrent overlapping',
    expect: 'Browser sticky caveat vs Node ALS',
  },
];

const log = loggerFactory.createLogger().setNamespace('demo:shared-log', 0);

export async function runSharedLogScenario(
  id: SharedLogScenarioId,
): Promise<{ ok: boolean; note?: string }> {
  switch (id) {
    case 'sync-action': {
      await loggerFactory.ensureActionContext({ span: 'demo.sync' }, async () => {
        log.with({ fn: 'syncAction', span: 'demo.sync' }).info('sync mid');
      });
      return { ok: true };
    }
    case 'nested-spans': {
      await loggerFactory.ensureActionContext({ span: 'demo.nest' }, async () =>
        runWithFunctionLog(log, { fn: 'outer', span: 'demo.nest' }, async () => {
          await runWithFunctionLog(
            log,
            { fn: 'inner', span: 'demo.nest' },
            async () => {
              log.with({ fn: 'inner', span: 'demo.nest' }).debug('nested mid');
            },
          );
        }),
      );
      return { ok: true };
    }
    case 'track-request': {
      await loggerFactory.ensureActionContext({ span: 'demo.http' }, async () =>
        runWithFunctionLog(log, { fn: 'withHttp', span: 'demo.http' }, async () => {
          await loggerFactory.trackRequest(
            {
              url: 'https://httpbin.org/get?token=demo-secret',
              method: 'GET',
            },
            async () => fetch('https://httpbin.org/get'),
          );
        }),
      );
      return { ok: true };
    }
    case 'orphan': {
      log.with({ fn: 'orphan', span: 'demo.orphan' }).warn('outside zone');
      return { ok: true };
    }
    case 'abort': {
      try {
        await loggerFactory.ensureActionContext({ span: 'demo.abort' }, async () =>
          runWithFunctionLog(log, { fn: 'abortable', span: 'demo.abort' }, async () => {
            throw new DOMException('Aborted', 'AbortError');
          }),
        );
        return { ok: false };
      } catch {
        return { ok: true, note: 'outcome should be abort' };
      }
    }
    case 'error': {
      try {
        await loggerFactory.ensureActionContext({ span: 'demo.error' }, async () =>
          runWithFunctionLog(log, { fn: 'boom', span: 'demo.error' }, () => {
            throw new Error('demo boom');
          }),
        );
        return { ok: false };
      } catch {
        return { ok: true };
      }
    }
    case 'concurrent': {
      await Promise.all([
        loggerFactory.ensureActionContext({ span: 'demo.a' }, async () => {
          await Promise.resolve();
          log.with({ fn: 'chainA', span: 'demo.a' }).info('A');
        }),
        loggerFactory.ensureActionContext({ span: 'demo.b' }, async () => {
          await Promise.resolve();
          log.with({ fn: 'chainB', span: 'demo.b' }).info('B');
        }),
      ]);
      return {
        ok: true,
        note: 'In browser sticky zone, A/B may share actionId',
      };
    }
    default:
      return { ok: false, note: 'unknown' };
  }
}

export function formatSharedLogRecord(r: LogRecord): string {
  const h = r.header;
  const parts = [
    h.index != null ? `#${h.index}` : '',
    h.level.toUpperCase(),
    h.namespaces.join(':'),
    h.actionId ? `action=${h.actionId.slice(0, 8)}…` : '',
    h.spanId ? `span=${h.spanId.slice(0, 8)}…` : '',
    h.parentSpanId ? `parent=${h.parentSpanId.slice(0, 8)}…` : '',
    h.requestId ? `http=${h.requestId.slice(0, 8)}…` : '',
    h.durationMs != null ? `${h.durationMs}ms` : '',
    h.outcome ?? '',
    h.fn ?? '',
    String(r.args[0] ?? ''),
  ].filter(Boolean);
  return parts.join(' ');
}
