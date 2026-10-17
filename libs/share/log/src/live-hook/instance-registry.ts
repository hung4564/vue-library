import type { Framework } from './types';

export interface InstanceMetadata {
  id: string;
  framework: Framework;
  component: string;
  parentId?: string;
  parent?: string;
}

const instanceIds = new WeakMap<object, string>();
const instances = new Map<string, InstanceMetadata>();

let nextVueId = 0;
let nextReactId = 0;

function createInstanceId(framework: Framework): string {
  if (framework === 'vue') {
    return `vue:${++nextVueId}`;
  }

  return `react:${++nextReactId}`;
}

export function registerInstance(
  instance: object,
  metadata: Omit<InstanceMetadata, 'id'>,
): InstanceMetadata {
  const existingId = instanceIds.get(instance);

  if (existingId) {
    const existing = instances.get(existingId);

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
  instances.set(id, record);

  return record;
}

export function getInstanceId(instance: object): string | undefined {
  return instanceIds.get(instance);
}

export function getInstanceMetadata(
  instanceId: string,
): InstanceMetadata | undefined {
  return instances.get(instanceId);
}

export function unregisterInstance(instance: object): void {
  const id = instanceIds.get(instance);

  if (!id) return;

  instanceIds.delete(instance);
  instances.delete(id);
}

export function getRegisteredInstances(): InstanceMetadata[] {
  return [...instances.values()];
}
