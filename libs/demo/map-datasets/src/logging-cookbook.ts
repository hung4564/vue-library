/**
 * Shared Logging / Action Flow cookbook runners for Vue + React demo-map.
 * Open Devtools → Logs → Flow after each button.
 */
import { createMapMitt } from '@hungpvq/map-core';
import { loggerFactory, runWithFunctionLog } from '@hungpvq/shared-log';

const cookbookLog = () =>
  loggerFactory.createLogger().setNamespace('demo:logging-cookbook', 0);

export type CookbookScenarioId =
  | 'sync-action'
  | 'nested-spans'
  | 'track-request'
  | 'mitt'
  | 'http-error'
  | 'orphan'
  | 'abort'
  | 'concurrent'
  | 'throw-error';

export const COOKBOOK_CHECKLIST: ReadonlyArray<{
  id: CookbookScenarioId;
  label: string;
  expect: string;
}> = [
  {
    id: 'sync-action',
    label: '1. Sync ensureActionContext',
    expect: 'Single actionId; hierarchical indexes',
  },
  {
    id: 'nested-spans',
    label: '2. Nested runWithFunctionLog',
    expect: 'Child parentSpanId === parent spanId',
  },
  {
    id: 'track-request',
    label: '3. trackRequest / fetch',
    expect: 'HTTP requestId ≠ actionId; method/status/duration',
  },
  {
    id: 'mitt',
    label: '4. Mitt emit + handler',
    expect: 'EMIT + handler restores ambient (packLogEvent)',
  },
  {
    id: 'http-error',
    label: '10. HTTP / throw error',
    expect: 'ERROR + outcome; error rethrown',
  },
  {
    id: 'orphan',
    label: '11. Log outside zone',
    expect: 'Mints new actionId (orphan)',
  },
  {
    id: 'abort',
    label: '8. AbortSignal cancel',
    expect: 'outcome: abort on frame close',
  },
  {
    id: 'concurrent',
    label: '9. Concurrent overlapping',
    expect: 'Browser sticky caveat — compare Node ALS tests',
  },
  {
    id: 'throw-error',
    label: '10b. Sync throw',
    expect: 'ERROR + outcome error',
  },
];

export async function runCookbookScenario(
  id: CookbookScenarioId,
  mapId?: string,
): Promise<{ ok: boolean; note?: string }> {
  const log = cookbookLog();
  const base = { mapId, span: 'cookbook' as const };

  switch (id) {
    case 'sync-action': {
      await loggerFactory.ensureActionContext(base, async () => {
        log.with({ fn: 'syncAction', span: 'cookbook' }).info('sync mid');
      });
      return { ok: true };
    }
    case 'nested-spans': {
      await loggerFactory.ensureActionContext(base, async () =>
        runWithFunctionLog(log, { fn: 'outer', span: 'cookbook' }, async () => {
          await runWithFunctionLog(
            log,
            { fn: 'inner', span: 'cookbook' },
            async () => {
              log.with({ fn: 'inner', span: 'cookbook' }).debug('nested mid');
            },
          );
        }),
      );
      return {
        ok: true,
        note: 'Inspect Flow: inner.parentSpanId === outer.spanId',
      };
    }
    case 'track-request': {
      await loggerFactory.ensureActionContext(base, async () =>
        runWithFunctionLog(
          log,
          { fn: 'withHttp', span: 'cookbook' },
          async () => {
            await loggerFactory.trackRequest(
              {
                url: 'https://httpbin.org/get?token=demo-secret',
                method: 'GET',
                mapId,
              },
              async () => {
                const res = await fetch('https://httpbin.org/get');
                return res;
              },
            );
          },
        ),
      );
      return { ok: true };
    }
    case 'mitt': {
      type Ev = { ping: { n: number } };
      const bus = createMapMitt<Ev>({ mapId });
      let seen: string | undefined;
      bus.on('ping', () => {
        seen = loggerFactory.getContext()?.actionId;
      });
      await loggerFactory.ensureActionContext(base, async () =>
        runWithFunctionLog(log, { fn: 'emitOuter', span: 'cookbook' }, () => {
          bus.emit('ping', { n: 1 });
        }),
      );
      return { ok: Boolean(seen), note: `handler actionId=${seen}` };
    }
    case 'http-error': {
      try {
        await loggerFactory.ensureActionContext(base, async () =>
          loggerFactory.trackRequest(
            { url: 'https://httpbin.org/status/404', method: 'GET', mapId },
            async () => {
              const res = await fetch('https://httpbin.org/status/404');
              if (!res.ok) throw new Error(`HTTP ${res.status}`);
              return res;
            },
          ),
        );
        return { ok: false, note: 'expected throw' };
      } catch {
        return { ok: true, note: 'threw as expected — check ERROR + outcome' };
      }
    }
    case 'orphan': {
      log.with({ fn: 'orphan', span: 'cookbook', mapId }).warn('outside zone');
      return { ok: true, note: 'new actionId minted on orphan log' };
    }
    case 'abort': {
      try {
        await loggerFactory.ensureActionContext(base, async () =>
          runWithFunctionLog(
            log,
            { fn: 'abortable', span: 'cookbook' },
            async () => {
              const err = new DOMException('Aborted', 'AbortError');
              throw err;
            },
          ),
        );
        return { ok: false };
      } catch {
        return { ok: true, note: 'outcome should be abort' };
      }
    }
    case 'concurrent': {
      await Promise.all([
        loggerFactory.ensureActionContext(
          { ...base, span: 'cookbook.a' },
          async () => {
            await Promise.resolve();
            log.with({ fn: 'chainA', span: 'cookbook.a' }).info('A');
          },
        ),
        loggerFactory.ensureActionContext(
          { ...base, span: 'cookbook.b' },
          async () => {
            await Promise.resolve();
            log.with({ fn: 'chainB', span: 'cookbook.b' }).info('B');
          },
        ),
      ]);
      return {
        ok: true,
        note: 'In browser sticky zone, A/B may share actionId — Node ALS isolates',
      };
    }
    case 'throw-error': {
      try {
        await loggerFactory.ensureActionContext(base, async () =>
          runWithFunctionLog(log, { fn: 'boom', span: 'cookbook' }, () => {
            throw new Error('cookbook boom');
          }),
        );
        return { ok: false };
      } catch {
        return { ok: true };
      }
    }
    default:
      return { ok: false, note: 'unknown scenario' };
  }
}
