export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

/** How this log sits in a reconstructed execution tree. */
export type LogFlowKind = 'call' | 'emit' | 'handler';

/** Frame close status for Flow filtering. */
export type LogOutcome = 'ok' | 'error' | 'abort';

/**
 * Ambient / bound fields merged into every log header.
 *
 * Correlation IDs:
 * - `actionId` — one user/action (replaces former action-level `requestId`)
 * - `spanId` — one operation frame (replaces former `functionId`)
 * - `parentSpanId` — parent frame's `spanId` when nested
 * - `requestId` — HTTP request only (`trackRequest`)
 */
export type LogContext = {
  /** User/action correlation id. */
  actionId?: string;
  /** Operation frame id (START/END pairing). */
  spanId?: string;
  /** Parent frame's `spanId` when nested under `runWithFunctionLog`. */
  parentSpanId?: string;
  /** HTTP request id — set only by `trackRequest`. */
  requestId?: string;
  mapId?: string;
  span?: string;
  fn?: string;
  /** Dataset UI host control id (e.g. layer-control, identify). */
  control?: string;
  /** Menu action id when started from a menu click. */
  menuId?: string;
  /** Menu action display name. */
  menuName?: string;
  /** Dataset / layer id related to the action. */
  datasetId?: string;
  /** Dataset / layer display name when known. */
  datasetName?: string;
  /** Dataset type string when known. */
  datasetType?: string;
  /** Mitt / bus event name for emit or handler logs. */
  eventName?: string;
  /** Call / mitt emit / mitt handler — for Request Flow reconstruction. */
  flowKind?: LogFlowKind;
  /** Nesting depth (0 = root). */
  flowDepth?: number;
  /** Parent function name (label). */
  parentFn?: string;
  /** Elapsed ms for a closed frame or HTTP call. */
  durationMs?: number;
  /** Frame / request outcome. */
  outcome?: LogOutcome;
  errorName?: string;
  errorMessage?: string;
  httpMethod?: string;
  httpStatus?: number;
  /** Sanitized URL (no secrets). */
  httpUrl?: string;
  featureCount?: number;
  hitCount?: number;
  componentKey?: string;
  check?: string;
};

export type LogHeader = {
  ts: number;
  level: LogLevel;
  namespaces: string[];
  /**
   * Hierarchical method write order (`1`, `1.1`, `2`). Prefer over `ts`
   * when sorting within one action — many logs share the same millisecond.
   */
  index?: string;
} & LogContext;

export type LogRecord = {
  /** Stable id for UI selection / Flow (minted when the record is built). */
  id: string;
  header: LogHeader;
  args: unknown[];
};

export interface LogAdapter {
  log(record: LogRecord): void;
  /** When true, receives logs even when logging is globally disabled */
  alwaysOn?: boolean;
}
