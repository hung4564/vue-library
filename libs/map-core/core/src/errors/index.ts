/**
 * Base error class for all map-related errors.
 */
export class MapError extends Error {
  public readonly code: string;
  private _context?: Record<string, any>;
  public readonly recoverable: boolean;
  public readonly cause?: unknown;

  constructor(
    message: string,
    code: string,
    options?: {
      context?: Record<string, any>;
      recoverable?: boolean;
      cause?: unknown;
    },
  ) {
    super(message);

    this.name = new.target.name;
    this.code = code;
    this._context = options?.context;
    this.recoverable = options?.recoverable ?? false;
    this.cause = options?.cause;

    // Keep cause stack short — overflow stacks can be enormous.
    if (options?.cause instanceof Error && options.cause.stack) {
      const causeStack = options.cause.stack.slice(0, 4000);
      this.stack = `${this.stack ?? ''}\nCaused by:\n${causeStack}`;
    }

    Object.setPrototypeOf(this, new.target.prototype);
  }
  public get context() {
    return this._context;
  }
  public setContext(context?: Record<string, any>) {
    this._context = { ...this._context, ...context };
  }
}

/**
 * Error thrown when map initialization fails.
 */
export class MapInitializationError extends MapError {
  constructor(
    message: string,
    options?: {
      context?: Record<string, any>;
      cause?: unknown;
    },
  ) {
    super(message, 'MAP_INIT_ERROR', {
      ...options,
      recoverable: false,
    });
  }
}

/**
 * Error thrown when map events fail.
 */
export class MapEventError extends MapError {
  constructor(
    message: string,
    options?: {
      context?: Record<string, any>;
      cause?: unknown;
    },
  ) {
    super(message, 'MAP_EVENT_ERROR', {
      ...options,
      recoverable: false,
    });
  }
}

/**
 * Error thrown when basemap operations fail.
 */
export class BasemapError extends MapError {
  constructor(
    message: string,
    options?: {
      context?: Record<string, any>;
      recoverable?: boolean;
      cause?: unknown;
    },
  ) {
    super(message, 'BASEMAP_ERROR', {
      recoverable: options?.recoverable ?? true,
      context: options?.context,
      cause: options?.cause,
    });
  }
}
