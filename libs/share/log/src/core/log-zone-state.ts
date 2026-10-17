import type { LogContext } from './types';

/**
 * Full ambient zone payload: public log fields + hierarchical index counters.
 * `indexPath` is zone-private (not part of LogHeader); used to mint `header.index`.
 */
export type LogZoneState = {
  context: LogContext;
  /** One counter per method depth; join with `.` for header.index */
  indexPath: number[];
};

export function compactLogContext(ctx: LogContext): LogContext {
  const out: LogContext = {};
  for (const [key, value] of Object.entries(ctx) as [
    keyof LogContext,
    LogContext[keyof LogContext],
  ][]) {
    if (value !== undefined && value !== null && value !== '') {
      (out as Record<string, unknown>)[key] = value;
    }
  }
  return out;
}

/** Increment leaf counter and return dotted index (`1`, `1.1`, …). */
export function bumpMethodIndex(state: LogZoneState): string {
  const path =
    state.indexPath.length > 0 ? state.indexPath : (state.indexPath = [0]);
  const last = path.length - 1;
  path[last] = (path[last] ?? 0) + 1;
  return path.join('.');
}

/**
 * Enter a nested method body frame after START bumped the parent leaf.
 * Mutates `indexPath` in place (`[1]` → `[1, 0]`) so the next bump is `1.1`.
 */
export function pushMethodFrame(state: LogZoneState): LogZoneState {
  state.indexPath.push(0);
  return state;
}

/** Snapshot for packing across mitt / delayed boundaries. */
export function snapshotZoneState(
  state: LogZoneState | undefined,
): LogZoneState | undefined {
  if (!state) return undefined;
  return {
    context: { ...state.context },
    indexPath: [...state.indexPath],
  };
}
