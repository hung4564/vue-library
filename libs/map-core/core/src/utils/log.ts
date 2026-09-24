import { type Logger, loggerFactory } from '@hungpvq/shared-log';

/**
 * Logger helper — bound view with mapId + extra namespaces.
 * Does not mutate the shared logger's namespace map.
 */
export function logHelper(
  logger: ReturnType<typeof loggerFactory.createLogger> | Logger,
  mapId: string,
  ...namespaces: string[]
): Logger {
  return logger.with({ mapId }, namespaces);
}
