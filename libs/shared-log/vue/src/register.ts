import {
  ensureHungpvqDebugHost,
  type DebugTabRegistration,
} from '@hungpvq/shared-log';
import { markRaw } from 'vue';

function rawComponent(component: unknown): unknown {
  return component && typeof component === 'object'
    ? markRaw(component)
    : component;
}

export function registerDebugTab(
  tab: Omit<DebugTabRegistration, 'framework'>,
): () => void {
  return ensureHungpvqDebugHost().registerTab({
    ...tab,
    component: rawComponent(tab.component),
    framework: 'vue',
  });
}
