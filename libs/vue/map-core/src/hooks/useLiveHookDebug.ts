import { useLiveHookDebug as useSharedLiveHookDebug } from '@hungpvq/shared-log/vue';

export function useLiveHookDebug(name: string, enabled = true): void {
  if (!enabled) return;
  useSharedLiveHookDebug(name);
}
