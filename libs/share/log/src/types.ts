export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

/** How this log sits in a reconstructed execution tree. */
export type LogFlowKind = 'call' | 'emit' | 'handler';

/** Ambient / bound fields merged into every log header. */
export type LogContext = {
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
  /** Legacy / Devtools buffer: call, mitt emit, or mitt handler. */
  flowKind?: LogFlowKind;
  /** Legacy / Devtools buffer: nesting depth (0 = root). */
  flowDepth?: number;
  /** Legacy / Devtools buffer: parent function name. */
  parentFn?: string;
  /** Legacy / Devtools buffer: per-invocation id. */
  functionId?: string;
};

export type LogHeader = {
  ts: number;
  level: LogLevel;
  namespaces: string[];
  /**
   * Monotonic write order (process-wide). Prefer this over `ts` when sorting —
   * many logs share the same millisecond.
   */
  index?: number;
  /** Deprecated: no longer written by Logger; kept for older buffered entries. */
  file?: string;
} & LogContext;

export type LogRecord = {
  header: LogHeader;
  args: unknown[];
};

export interface LogAdapter {
  log(record: LogRecord): void;
  /** When true, receives logs even when logging is globally disabled */
  alwaysOn?: boolean;
}
