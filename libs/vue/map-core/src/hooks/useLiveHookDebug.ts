import { loggerFactory } from '@hungpvq/shared-log';
import { getCurrentInstance, onUnmounted, onUpdated } from 'vue';

const logger = loggerFactory.createLogger().setNamespace('map:hook');

export function useLiveHookDebug(name: string, enabled = true): void {
  let renderCount = 0;
  const instance = getCurrentInstance();

  if (!instance) {
    console.warn(`[LiveHook][vue] ${name} must be called inside setup()`);
    return;
  }

  if (enabled) {
    logger.debug(name, 'init');
  }
  onUpdated(() => {
    renderCount += 1;
    logger.debug(name, `render #${renderCount}`);
  });

  onUnmounted(() => {
    if (enabled) {
      logger.debug(name, 'unmount');
    }
  });
}
