export type NextFn = () => Promise<any> | any;

/**
 * Final handler is called when the entire chain has been
 * executed successfully.
 */
export type FinalHandler = () => Promise<any>;

/**
 * Error handler is called any method in the pipeline raises
 * an exception
 */
export type ErrorHandler = (error: any) => Promise<any>;

/**
 * The executor function that invokes the middleware
 */
export type Executor<MiddlewareFn> = (
  middleware: MiddlewareFn,
  next: NextFn
) => Promise<any>;
