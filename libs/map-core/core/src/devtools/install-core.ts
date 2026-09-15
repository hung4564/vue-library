import {
  ConsoleAdapter,
  LoggerFactory,
  type LogAdapter,
} from '@hungpvq/shared-log';

import { errorHandler } from '../services/error-handler.service';
import { installGlobalErrorCapture } from '../services/global-error-capture';

/**
 * Shared devtools bootstrap: console + devtool log adapters and global error capture.
 * Framework packages keep `installDevtools` / `uninstallDevtools` lifecycle thin.
 */
export function installDevtoolsCore(devtoolLogAdapter: LogAdapter): () => void {
  const logger = LoggerFactory.getInstance();
  logger.clearAdapters();
  logger.addAdapter(new ConsoleAdapter());
  logger.addAdapter(devtoolLogAdapter);
  return installGlobalErrorCapture(errorHandler);
}
