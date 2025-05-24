import { loggerFactory } from '@hungpvq/shared-log';

export function logHelper(
  logger: ReturnType<typeof loggerFactory.createLogger>,
  mapId: string,
  ...namespaces: string[]
) {
  const typeLogger = logger.getNamespace(2) || '';
  logger.setNamespace(mapId, 1);
  logger.setNamespace(typeLogger, 2);
  namespaces.forEach((namespace, i) => {
    logger.setNamespace(namespace, 3 + i);
  });
  return logger;
}
