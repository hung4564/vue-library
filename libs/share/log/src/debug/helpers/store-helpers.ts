import { GlobalStoreService } from '@hungpvq/shared-store';

/** Shallow snapshot of the process-wide shared store bag. */
export function snapshotGlobalStore(): Record<string, unknown> {
  return { ...GlobalStoreService.getInstance().getState() };
}
