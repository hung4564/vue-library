import type {
  DatasetMenuEntry,
  DatasetMenuFor,
  MenuAction,
} from '../interfaces/dataset.parts';

/**
 * Process-wide default menus merged into every `getResolvedMenus` result.
 * Used by optional debug tooling (`@hungpvq/map-debug`) without coupling builders.
 */
const globalEntries: DatasetMenuEntry[] = [];

function menuActionFromEntry(entry: DatasetMenuEntry): MenuAction {
  const id = entry.menu.id ?? entry.key;
  const base = id ? { ...entry.menu, id } : { ...entry.menu };
  if (!entry.byControl) return base;
  const existing =
    'byControl' in base && base.byControl ? base.byControl : undefined;
  return {
    ...base,
    byControl: { ...existing, ...entry.byControl },
  };
}

/** Register default menus for all datasets. Returns disposer. */
export function registerGlobalDatasetMenus(
  entries: DatasetMenuEntry[],
): () => void {
  const added: DatasetMenuEntry[] = [];
  for (const entry of entries) {
    if (!entry?.for || !entry.key) continue;
    const index = globalEntries.findIndex(
      (e) => e.for === entry.for && e.key === entry.key,
    );
    if (index >= 0) {
      globalEntries[index] = entry;
    } else {
      globalEntries.push(entry);
    }
    added.push(entry);
  }
  return () => {
    for (const entry of added) {
      const index = globalEntries.findIndex(
        (e) => e.for === entry.for && e.key === entry.key,
      );
      if (index >= 0) globalEntries.splice(index, 1);
    }
  };
}

export function clearGlobalDatasetMenus(): void {
  globalEntries.length = 0;
}

export function getGlobalDatasetMenus(target: DatasetMenuFor): MenuAction[] {
  const byKey = new Map<string, MenuAction>();
  for (const entry of globalEntries) {
    if (entry.for !== target) continue;
    byKey.set(entry.key, menuActionFromEntry(entry));
  }
  return [...byKey.values()];
}
