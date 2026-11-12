import { useLiveHookDebug as useSharedLiveHookDebug } from '@hungpvq/vue-shared-log';

export function useLiveHookDebug(
  name: string,
  enabled = true,
): string | undefined {
  return useSharedLiveHookDebug(name, enabled);
}
