import type {
  AnyFallbackAction,
  FallbackAction,
  FallbackPrepare,
  FallbackResolverOptions,
  FallbackResult,
} from './types';

function mergeContext<TContext>(
  context: TContext,
  extra: Partial<TContext> | void,
): TContext {
  if (extra == null) return context;
  return {
    ...context,
    ...extra,
  };
}

export class FallbackResolver<TContext> {
  private actions: AnyFallbackAction<TContext>[] = [];
  private prepare?: FallbackPrepare<TContext>;
  private fallback?: (context: TContext) => void | Promise<void>;

  constructor(actions: AnyFallbackAction<TContext>[] = []) {
    this.actions = [...actions];
  }

  /**
   * Global prepare — chạy đúng một lần trước mọi action.
   * Return value is shallow-merged into the shared context.
   */
  setPrepare(prepare: FallbackPrepare<TContext>): this {
    this.prepare = prepare;
    return this;
  }

  /**
   * Chạy khi không action nào phù hợp hoặc đều lỗi.
   */
  setFallback(
    fallback: (context: TContext) => void | Promise<void>,
  ): this {
    this.fallback = fallback;
    return this;
  }

  add<TExtra = unknown>(action: FallbackAction<TContext, TExtra>): this {
    this.actions.push(action as AnyFallbackAction<TContext>);
    return this;
  }

  addMany(actions: AnyFallbackAction<TContext>[]): this {
    this.actions.push(...actions);
    return this;
  }

  clear(): this {
    this.actions.length = 0;
    return this;
  }

  private getSortedActions() {
    return [...this.actions].sort(
      (a, b) => (b.priority ?? 0) - (a.priority ?? 0),
    );
  }

  async execute(
    initialContext: TContext,
    options: FallbackResolverOptions<TContext> = {},
  ): Promise<FallbackResult<TContext>> {
    const {
      prepare,
      fallback = this.fallback,
      onError,
      continueOnError = true,
    } = options;

    let context = initialContext;

    if (this.prepare) {
      context = mergeContext(context, await this.prepare(context));
    }

    if (prepare) {
      context = mergeContext(context, await prepare(context));
    }

    const errors: FallbackResult<TContext>['errors'] = [];
    const succeeded: AnyFallbackAction<TContext>[] = [];
    const actions = this.getSortedActions();

    let exclusiveDone = false;
    let exclusiveAction: AnyFallbackAction<TContext> | undefined;
    let resultContext = context;

    for (const action of actions) {
      const isAlways = !!action.always;
      if (!isAlways && exclusiveDone) continue;

      if (action.when) {
        const matched = await action.when(context);
        if (!matched) continue;
      }

      let actionContext = { ...context } as TContext;

      try {
        if (action.prepare) {
          const extra = await action.prepare(actionContext);
          if (extra != null && typeof extra === 'object') {
            actionContext = {
              ...actionContext,
              ...extra,
            };
          }
        }

        await action.execute(actionContext);

        succeeded.push(action);
        resultContext = actionContext;

        if (!isAlways) {
          exclusiveDone = true;
          exclusiveAction = action;
        }
      } catch (error) {
        errors.push({
          action,
          error,
        });

        onError?.(error, action, actionContext);

        if (!continueOnError) {
          throw error;
        }
      }
    }

    if (succeeded.length === 0) {
      await fallback?.(context);
      return {
        success: false,
        context,
        errors,
      };
    }

    return {
      success: true,
      action: exclusiveAction ?? succeeded[succeeded.length - 1],
      actions: succeeded,
      context: resultContext,
      errors,
    };
  }
}
