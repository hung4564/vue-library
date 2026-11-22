/**
 * Vendor copy of the `__hungpvqDebug` pin stub.
 * Packages that must not peer `@hungpvq/shared-log` copy this file.
 * `installDebug()` adopts the same object if the stub already exists.
 */
export type DebugTabFramework = 'vue' | 'react';

export type DebugTabRegistration = {
  id: string;
  label: string | (() => string);
  order?: number;
  framework: DebugTabFramework;
  component: unknown;
  badge?: () => number | string | undefined;
  hidden?: () => boolean;
};

export type HungpvqDebugHost = {
  registerTab(tab: DebugTabRegistration): () => void;
  unregisterTab(id: string): void;
  listTabs(framework?: DebugTabFramework): DebugTabRegistration[];
  subscribe(fn: () => void): () => void;
  openTab(id: string): void;
  setOpen(open: boolean): void;
  setActiveTab(id: string): void;
  isOpen(): boolean;
  getActiveTab(): string;
  help?: () => void;
};

type GlobalWithDebug = typeof globalThis & {
  __hungpvqDebug?: HungpvqDebugHost;
};

function createDebugHostStub(): HungpvqDebugHost {
  const tabs = new Map<string, DebugTabRegistration>();
  const listeners = new Set<() => void>();
  let open = false;
  let activeTab = 'store';

  const notify = () => {
    for (const listener of listeners) listener();
  };

  const host: HungpvqDebugHost = {
    registerTab(tab) {
      tabs.set(tab.id, tab);
      notify();
      return () => host.unregisterTab(tab.id);
    },
    unregisterTab(id) {
      if (!tabs.delete(id)) return;
      if (activeTab === id) {
        const next = host.listTabs()[0];
        activeTab = next?.id ?? 'store';
      }
      notify();
    },
    listTabs(framework) {
      return [...tabs.values()]
        .filter((tab) => {
          if (framework && tab.framework !== framework) return false;
          if (!tab.component) return false;
          try {
            return !tab.hidden?.();
          } catch {
            return true;
          }
        })
        .sort((a, b) => (a.order ?? 50) - (b.order ?? 50));
    },
    subscribe(fn) {
      listeners.add(fn);
      return () => {
        listeners.delete(fn);
      };
    },
    openTab(id) {
      const tab = tabs.get(id);
      if (!tab) return;
      try {
        if (tab.hidden?.()) return;
      } catch {
        /* ignore */
      }
      activeTab = id;
      open = true;
      notify();
    },
    setOpen(next) {
      if (open === next) return;
      open = next;
      notify();
    },
    setActiveTab(id) {
      if (activeTab === id) return;
      activeTab = id;
      notify();
    },
    isOpen: () => open,
    getActiveTab: () => activeTab,
  };

  return host;
}

export function ensureHungpvqDebugHost(): HungpvqDebugHost {
  const g = globalThis as GlobalWithDebug;
  if (!g.__hungpvqDebug) {
    g.__hungpvqDebug = createDebugHostStub();
  }
  return g.__hungpvqDebug;
}
