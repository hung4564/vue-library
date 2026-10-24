import {
  ensureHungpvqDebugHost,
  type DebugTabRegistration,
} from '@hungpvq/shared-log';

export function registerDebugTab(
  tab: Omit<DebugTabRegistration, 'framework'>,
): () => void {
  return ensureHungpvqDebugHost().registerTab({
    ...tab,
    framework: 'react',
  });
}
