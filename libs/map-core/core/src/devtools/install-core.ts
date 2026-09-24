import {
  ConsoleAdapter,
  type LogAdapter,
  LoggerFactory,
} from '@hungpvq/shared-log';

import { errorHandler } from '../services/error-handler.service';
import { installGlobalErrorCapture } from '../services/global-error-capture';

let installed = false;

/** True after `installDevtoolsCore` until its disposer runs. */
export function isMapDevtoolsInstalled(): boolean {
  return installed;
}

/**
 * Shared devtools bootstrap: console + devtool log adapters and global error capture.
 * Framework packages keep `installDevtools` / `uninstallDevtools` lifecycle thin.
 */
export function installDevtoolsCore(devtoolLogAdapter: LogAdapter): () => void {
  const logger = LoggerFactory.getInstance();
  logger.clearAdapters();
  logger.addAdapter(new ConsoleAdapter());
  logger.addAdapter(devtoolLogAdapter);
  installed = true;
  const uninstallCapture = installGlobalErrorCapture(errorHandler);
  return () => {
    uninstallCapture();
    installed = false;
  };
}
