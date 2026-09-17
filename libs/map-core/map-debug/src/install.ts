import { loggerFactory } from '@hungpvq/shared-log';

const logger = loggerFactory.createLogger().setNamespace('map-debug');

let installed = false;

/** Core map-debug install (no map-dataset). Idempotent. */
export function installMapDebug(): void {
  if (installed) return;
  installed = true;
  logger.debug('map-debug installed');
}

export function uninstallMapDebug(): void {
  if (!installed) return;
  installed = false;
  logger.debug('map-debug uninstalled');
}

export function isMapDebugInstalled(): boolean {
  return installed;
}
