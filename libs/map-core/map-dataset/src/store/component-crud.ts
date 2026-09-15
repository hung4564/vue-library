import type { ComponentType } from '../types';

export type DatasetComponentItem = {
  id: string;
  check?: string;
  /** Bumps on every add/upsert so hosts can re-open without remounting. */
  revision?: number;
} & ComponentType;

/** Framework-agnostic list state (`Ref` / `{ value }` both work). */
export type DatasetComponentListState = {
  components: DatasetComponentItem[];
  componentIds: { value: string[] };
};

export function generateDatasetComponentId(prefix = 'component'): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

/**
 * Upsert by `check` when set (bumps revision + moves id to end), otherwise append.
 * Returns the component id.
 */
export function upsertDatasetComponent(
  store: DatasetComponentListState,
  component: Omit<DatasetComponentItem, 'id'>,
): string {
  if (component.check) {
    const index = store.components.findIndex((x) => x.check === component.check);
    if (index >= 0) {
      const existing = store.components[index];
      const id = existing.id;
      Object.assign(existing, component, {
        id,
        revision: (existing.revision ?? 0) + 1,
      });
      store.componentIds.value.splice(index, 1);
      store.componentIds.value.push(id);
      return id;
    }
  }
  const id = generateDatasetComponentId();
  store.components.push({ ...component, id, revision: 1 });
  store.componentIds.value.push(id);
  return id;
}

export function removeDatasetComponent(
  store: DatasetComponentListState,
  id: string,
): void {
  store.components = store.components.filter((x) => x.id !== id);
  store.componentIds.value = store.componentIds.value.filter((x) => x !== id);
}
