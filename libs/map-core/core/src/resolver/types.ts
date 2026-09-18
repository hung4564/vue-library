export type MaybePromise<T> = T | Promise<T>;

/**
 * Global prepare (resolver-level / execute options).
 * Return value is shallow-merged into the shared context.
 */
export type FallbackPrepare<TContext> = (
  context: TContext,
) => MaybePromise<Partial<TContext> | void>;

/**
 * One fallback action.
 *
 * - `when` / `prepare` see the shared context (after global prepare).
 * - `prepare` may return action-local extras (`TExtra`), merged only for that action.
 * - `execute` receives `TContext & TExtra`.
 */
export type FallbackAction<TContext, TExtra = unknown> = {
  /**
   * Độ ưu tiên của action.
   * Số càng lớn sẽ được thử trước.
   *
   * Mặc định: 0
   */
  priority?: number;

  /**
   * Kiểm tra action có phù hợp với context hiện tại hay không.
   *
   * Nếu không khai báo `when` thì action luôn được áp dụng.
   */
  when?: (context: TContext) => MaybePromise<boolean>;

  /**
   * Nếu true: khi `when` thỏa thì luôn chạy, không dừng chuỗi fallback.
   * Action không có `always` vẫn dừng resolver sau khi execute thành công.
   *
   * Mặc định: false
   */
  always?: boolean;

  /**
   * Chuẩn bị thêm dữ liệu cho action.
   *
   * Dữ liệu trả về sẽ được merge vào context của action này.
   */
  prepare?: (context: TContext) => MaybePromise<TExtra>;

  /**
   * Thực thi action.
   *
   * Nếu throw/reject thì resolver sẽ thử action tiếp theo.
   */
  execute: (context: TContext & TExtra) => MaybePromise<void>;
};

/** Erased action type for heterogeneous action lists. */
export type AnyFallbackAction<TContext> = FallbackAction<TContext, any>;

export type FallbackResolverOptions<TContext> = {
  /**
   * Chuẩn bị / bổ sung dữ liệu trước khi bắt đầu chạy các action.
   * Return value is shallow-merged into the shared context.
   */
  prepare?: FallbackPrepare<TContext>;

  /**
   * Chạy khi tất cả action đều không phù hợp hoặc đều bị lỗi.
   */
  fallback?: (context: TContext) => MaybePromise<void>;

  /**
   * Callback khi một action bị lỗi.
   */
  onError?: (
    error: unknown,
    action: AnyFallbackAction<TContext>,
    context: TContext,
  ) => void;

  /**
   * Nếu false: action lỗi → throw ngay.
   * Mặc định true: action lỗi → thử action tiếp theo.
   */
  continueOnError?: boolean;
};

export type FallbackResult<TContext> = {
  /** Có action nào thực thi thành công hay không. */
  success: boolean;
  /** Action exclusive thành công đầu tiên, hoặc always thành công cuối cùng. */
  action?: AnyFallbackAction<TContext>;
  /** Các action đã execute thành công (exclusive + always). */
  actions?: AnyFallbackAction<TContext>[];
  /** Shared context (sau global prepare), hoặc action context nếu thành công. */
  context: TContext;
  /** Action đã được thử nhưng bị lỗi. */
  errors: Array<{
    action: AnyFallbackAction<TContext>;
    error: unknown;
  }>;
};
