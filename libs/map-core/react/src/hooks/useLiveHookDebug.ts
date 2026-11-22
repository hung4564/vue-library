import { useLiveHookDebug as useSharedLiveHookDebug } from '@hungpvq/react-shared-log';

export function useLiveHookDebug(
  name: string,
  enabled = true,
): string | undefined {
  return useSharedLiveHookDebug(name, undefined, enabled);
}
