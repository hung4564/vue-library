export const HUNGPVQ_DEBUG_KEY = '__hungpvqDebug';

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

declare global {
  interface Window {
    __hungpvqDebug?: HungpvqDebugHost;
  }
}

type GlobalWithDebug = typeof globalThis & {
  __hungpvqDebug?: HungpvqDebugHost;
};

function resolveLabel(tab: DebugTabRegistration): string {
  return typeof tab.label === 'function' ? tab.label() : tab.label;
}

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
    help() {
      const rows = [...tabs.values()].map((tab) => ({
        id: tab.id,
        label: resolveLabel(tab),
        framework: tab.framework,
        order: tab.order ?? 50,
      }));
      // F12 console API (same role as window.__hungpvqDatasetDebug.help).
      // eslint-disable-next-line no-console
      console.info('[__hungpvqDebug]', {
        isOpen: open,
        activeTab,
        tabs: rows,
        methods: [
          'registerTab',
          'unregisterTab',
          'listTabs',
          'openTab',
          'setOpen',
          'help',
        ],
      });
    },
  };

  return host;
}

/**
 * Process-wide debug host. Zero package imports — safe to vendor-copy.
 * First caller creates a stub; `installDebug` adopts the same object.
 */
export function ensureHungpvqDebugHost(): HungpvqDebugHost {
  const g = globalThis as GlobalWithDebug;
  if (!g.__hungpvqDebug) {
    g.__hungpvqDebug = createDebugHostStub();
  }
  return g.__hungpvqDebug;
}

export function peekHungpvqDebugHost(): HungpvqDebugHost | undefined {
  return (globalThis as GlobalWithDebug).__hungpvqDebug;
}

export function resetHungpvqDebugHostForTests(): void {
  delete (globalThis as GlobalWithDebug).__hungpvqDebug;
}

export function openDebugTab(id: string): void {
  ensureHungpvqDebugHost().openTab(id);
}

export function setDebugOpen(open: boolean): void {
  ensureHungpvqDebugHost().setOpen(open);
}

export function setDebugActiveTab(id: string): void {
  ensureHungpvqDebugHost().setActiveTab(id);
}

export function toggleDebugOpen(): void {
  const host = ensureHungpvqDebugHost();
  host.setOpen(!host.isOpen());
}
