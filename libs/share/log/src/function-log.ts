import {
  compactLogContext,
  type LogZoneState,
  pushMethodFrame,
} from './log-zone-state';
import type { Logger } from './Logger';
import { LoggerFactory } from './LoggerFactory';
import type { LogContext, LogOutcome } from './types';
import { getUUIDv4 } from './uuid';

function isPromiseLike<T>(value: T | PromiseLike<T>): value is PromiseLike<T> {
  return (
    value != null &&
    typeof value === 'object' &&
    typeof (value as PromiseLike<T>).then === 'function'
  );
}

function isAbortError(err: unknown): boolean {
  return (
    !!err &&
    typeof err === 'object' &&
    'name' in err &&
    (err as { name?: string }).name === 'AbortError'
  );
}

function safeErrorFields(
  err: unknown,
): Pick<LogContext, 'errorName' | 'errorMessage'> {
  if (err instanceof Error) {
    return { errorName: err.name, errorMessage: err.message };
  }
  if (typeof err === 'string') {
    return { errorMessage: err };
  }
  return { errorMessage: 'Unknown error' };
}

export type FunctionLogContext = LogContext & { fn: string; span: string };

export function getFlowStackDepth(): number {
  const ctx = LoggerFactory.getInstance().getContext();
  if (!ctx) return 0;
  if (ctx.spanId != null) return (ctx.flowDepth ?? 0) + 1;
  return ctx.flowDepth ?? 0;
}

export function getFlowParentFn(): string | undefined {
  const ctx = LoggerFactory.getInstance().getContext();
  if (ctx?.spanId) return ctx.fn;
  return ctx?.parentFn;
}

/**
 * Log START / END / ERROR around a sync or async function body.
 *
 * Index shape (shared mutable `indexPath`):
 * - `START` bumps current level → `1`
 * - body frame push → bumps yield `1.1`, `1.2`, …
 * - `END` pops then bumps parent → `2`
 *
 * Sets `spanId` and `parentSpanId` (= parent `spanId` when nested).
 */
export function runWithFunctionLog<T>(
  logger: Logger,
  ctx: FunctionLogContext,
  fn: () => T | Promise<T>,
): T | Promise<T> {
  const factory = LoggerFactory.getInstance();
  const parentState = factory.getZoneState();
  const parentCtx = parentState?.context;

  const spanId = ctx.spanId ?? getUUIDv4();
  const parentSpanId =
    ctx.parentSpanId ?? (parentCtx?.spanId ? parentCtx.spanId : undefined);
  const parentFn =
    ctx.parentFn ?? (parentCtx?.spanId ? parentCtx.fn : parentCtx?.parentFn);
  const flowDepth = parentCtx?.spanId ? (parentCtx.flowDepth ?? 0) + 1 : 0;
  const flowKind = ctx.flowKind ?? 'call';
  const actionId = ctx.actionId ?? parentCtx?.actionId;

  const bound = compactLogContext({
    ...ctx,
    actionId,
    spanId,
    parentSpanId,
    flowKind,
    flowDepth,
    parentFn,
    mapId: ctx.mapId ?? parentCtx?.mapId,
  });

  const ambient = compactLogContext({
    spanId,
    parentSpanId,
    fn: ctx.fn,
    span: ctx.span,
    flowKind,
    flowDepth,
    parentFn: bound.parentFn,
    mapId: bound.mapId,
    actionId,
    control: ctx.control ?? parentCtx?.control,
    menuId: ctx.menuId ?? parentCtx?.menuId,
    menuName: ctx.menuName ?? parentCtx?.menuName,
    datasetId: ctx.datasetId ?? parentCtx?.datasetId,
    datasetName: ctx.datasetName ?? parentCtx?.datasetName,
    datasetType: ctx.datasetType ?? parentCtx?.datasetType,
    eventName: ctx.eventName,
  });

  const mergedCtx = { ...(parentState?.context ?? {}), ...ambient };
  const entryState: LogZoneState = {
    context: mergedCtx,
    indexPath: parentState?.indexPath ?? [0],
  };

  const startedAt = performance.now();

  return factory.runWithZoneState(entryState, () => {
    logger.with(bound).debug('START');

    const zone = factory.getZoneState()!;
    pushMethodFrame(zone);

    const finishAtParent = (
      level: 'debug' | 'error',
      message: string,
      outcome: LogOutcome,
      err?: unknown,
    ) => {
      const cur = factory.getZoneState() ?? zone;
      if (cur.indexPath.length > 1) {
        cur.indexPath.pop();
      }
      const durationMs = Math.round(performance.now() - startedAt);
      const closeBound = compactLogContext({
        ...bound,
        durationMs,
        outcome,
        ...(level === 'error' ? safeErrorFields(err) : {}),
      });
      if (level === 'error') logger.with(closeBound).error(message);
      else logger.with(closeBound).debug(message);
    };

    try {
      const result = fn();
      if (isPromiseLike(result)) {
        return Promise.resolve(result).then(
          (value) => {
            finishAtParent('debug', 'END', 'ok');
            return value;
          },
          (err) => {
            finishAtParent(
              'error',
              'ERROR',
              isAbortError(err) ? 'abort' : 'error',
              err,
            );
            throw err;
          },
        ) as Promise<T>;
      }
      finishAtParent('debug', 'END', 'ok');
      return result;
    } catch (err) {
      finishAtParent(
        'error',
        'ERROR',
        isAbortError(err) ? 'abort' : 'error',
        err,
      );
      throw err;
    }
  });
}
