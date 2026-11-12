export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

/** How this log sits in a reconstructed execution tree. */
export type LogFlowKind = 'call' | 'emit' | 'handler';

/** Frame close status for Flow filtering. */
export type LogOutcome = 'ok' | 'error' | 'abort';

export type Framework = 'vue' | 'react' | 'core';

export type DebugKind = 'log' | 'live';

/**
 * Ambient / bound fields merged when a log is written.
 * Header keeps correlation keys; everything else is packed into `data.extra`.
 *
 * Correlation IDs:
 * - `actionId` — one user/action
 * - `spanId` — one operation frame
 * - `parentSpanId` — parent frame's `spanId` when nested
 * - `requestId` — HTTP request only (`trackRequest`)
 */
export type LogContext = {
  actionId?: string;
  spanId?: string;
  parentSpanId?: string;
  requestId?: string;
  mapId?: string;
  span?: string;
  fn?: string;
  control?: string;
  menuId?: string;
  menuName?: string;
  datasetId?: string;
  datasetName?: string;
  datasetType?: string;
  eventName?: string;
  flowKind?: LogFlowKind;
  flowDepth?: number;
  parentFn?: string;
  durationMs?: number;
  outcome?: LogOutcome;
  errorName?: string;
  errorMessage?: string;
  httpMethod?: string;
  httpStatus?: number;
  httpUrl?: string;
  featureCount?: number;
  hitCount?: number;
  componentKey?: string;
  check?: string;
};

/** Shared envelope header for Logs and Live. */
export type DebugHeader = {
  ts: number;
  kind: DebugKind;
  namespaces: string[];
  index?: string;
  actionId?: string;
  spanId?: string;
  parentSpanId?: string;
  fn?: string;
  span?: string;
  level?: LogLevel;
};

export type LogData = {
  args: unknown[];
  extra?: Record<string, unknown>;
};

export type LiveTraceEventName =
  | 'component:mount'
  | 'component:render'
  | 'component:update'
  | 'component:unmount';

export type LiveTraceChange = {
  source: string;
  key: string;
  previousValue: unknown;
  nextValue: unknown;
};

export type LiveData = {
  event: LiveTraceEventName;
  instanceId: string;
  component: string;
  framework: Framework;
  parentId?: string;
  renderCount?: number;
  changes?: LiveTraceChange[];
};

export type DebugRecord<TData = unknown> = {
  id: string;
  header: DebugHeader;
  data: TData;
};

export interface LogAdapter {
  log(record: DebugRecord<LogData>): void;
  /** When true, receives logs even when logging is globally disabled */
  alwaysOn?: boolean;
}
