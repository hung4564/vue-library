import { getLogDebugStore } from '../debug/store';
import type { Framework } from './types';

export interface InstanceMetadata {
  id: string;
  framework: Framework;
  component: string;
  parentId?: string;
}

const instanceIds = new WeakMap<object, string>();

function notifyInstances() {
  const bag = getLogDebugStore();
  bag.instanceSnapshot = [...bag.instances.values()];
  for (const listener of bag.instanceListeners) listener();
}

export function subscribeInstances(listener: () => void): () => void {
  const bag = getLogDebugStore();
  bag.instanceListeners.add(listener);
  return () => {
    bag.instanceListeners.delete(listener);
  };
}

function createInstanceId(framework: Framework): string {
  const bag = getLogDebugStore();
  if (framework === 'vue') {
    return `vue:${++bag.nextVueId}`;
  }
  return `react:${++bag.nextReactId}`;
}

export function registerInstance(
  instance: object,
  metadata: Omit<InstanceMetadata, 'id'>,
): InstanceMetadata {
  const bag = getLogDebugStore();
  const existingId = instanceIds.get(instance);

  if (existingId) {
    const existing = bag.instances.get(existingId);
    if (existing) {
      Object.assign(existing, metadata);
      return existing;
    }
  }

  const id = createInstanceId(metadata.framework);
  const record: InstanceMetadata = {
    ...metadata,
    id,
  };

  instanceIds.set(instance, id);
  bag.instances.set(id, record);
  notifyInstances();

  return record;
}

export function getInstanceId(instance: object): string | undefined {
  return instanceIds.get(instance);
}

export function getInstanceMetadata(
  instanceId: string,
): InstanceMetadata | undefined {
  return getLogDebugStore().instances.get(instanceId);
}

export function unregisterInstance(instance: object): void {
  const id = instanceIds.get(instance);
  if (!id) return;

  instanceIds.delete(instance);
  getLogDebugStore().instances.delete(id);
  notifyInstances();
}

export function getRegisteredInstances(): InstanceMetadata[] {
  return getLogDebugStore().instanceSnapshot;
}

export function resetInstanceRegistryForTests(): void {
  const bag = getLogDebugStore();
  bag.instances.clear();
  bag.instanceListeners.clear();
  bag.instanceSnapshot = [];
  bag.nextVueId = 0;
  bag.nextReactId = 0;
}
