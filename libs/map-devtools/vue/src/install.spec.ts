import {
  peekHungpvqDebugHost,
  resetHungpvqDebugHostForTests,
  setDebugTabEnabled,
  toggleDebugTab,
} from '@hungpvq/shared-log';
import { registerDragDebugTab } from '@hungpvq/vue-draggable';
import { registerStoreDebugTab } from '@hungpvq/vue-shared-log';
import { afterEach, describe, expect, it } from 'vitest';

import {
  installDevtools,
  uninstallDevtools,
} from './install';

afterEach(() => {
  uninstallDevtools();
  resetHungpvqDebugHostForTests();
});

describe('vue-map-devtools installDevtools', () => {
  it('registers only specified tabs when tabs option is provided as functions', () => {
    installDevtools({
      tabs: [registerStoreDebugTab, registerDragDebugTab],
    });

    const tabs = peekHungpvqDebugHost()?.listTabs('vue') ?? [];
    const ids = tabs.map((t) => t.id);
    expect(ids).toContain('store');
    expect(ids).toContain('draggable');
    expect(ids).not.toContain('live');
    expect(ids).not.toContain('logs');
    expect(ids).not.toContain('errors');
  });

  it('registers tabs by id string array', () => {
    installDevtools({
      tabs: ['store', 'draggable'],
    });

    const tabs = peekHungpvqDebugHost()?.listTabs('vue') ?? [];
    const ids = tabs.map((t) => t.id);
    expect(ids).toEqual(['store', 'draggable']);
  });

  it('turns off tabs by id using object config', () => {
    installDevtools({
      tabs: {
        live: false,
        errors: false,
        draggable: true,
      },
    });

    const tabs = peekHungpvqDebugHost()?.listTabs('vue') ?? [];
    const ids = tabs.map((t) => t.id);
    expect(ids).toEqual(['store', 'draggable', 'logs', 'tabs']);
  });

  it('disables tabs by id using disabledTabs option', () => {
    installDevtools({
      disabledTabs: ['live', 'errors'],
    });

    const tabs = peekHungpvqDebugHost()?.listTabs('vue') ?? [];
    const ids = tabs.map((t) => t.id);
    expect(ids).toEqual(['store', 'logs', 'tabs']);
  });

  it('enables only specific tabs by id using enabledTabs option', () => {
    installDevtools({
      enabledTabs: ['store', 'draggable'],
    });

    const tabs = peekHungpvqDebugHost()?.listTabs('vue') ?? [];
    const ids = tabs.map((t) => t.id);
    expect(ids).toEqual(['store']);
  });

  it('allows dynamic toggle on/off by id at runtime', () => {
    installDevtools();
    const beforeIds = (peekHungpvqDebugHost()?.listTabs('vue') ?? []).map((t) => t.id);
    expect(beforeIds).toContain('store');

    setDebugTabEnabled('store', false);
    const disabledIds = (peekHungpvqDebugHost()?.listTabs('vue') ?? []).map((t) => t.id);
    expect(disabledIds).not.toContain('store');

    toggleDebugTab('store');
    const reEnabledIds = (peekHungpvqDebugHost()?.listTabs('vue') ?? []).map((t) => t.id);
    expect(reEnabledIds).toContain('store');
  });

  it('unregisters custom tabs when uninstallDevtools is called', () => {
    installDevtools({
      tabs: [registerStoreDebugTab, registerDragDebugTab],
    });

    uninstallDevtools();

    const tabs = peekHungpvqDebugHost()?.listTabs('vue') ?? [];
    expect(tabs.length).toBe(0);
  });

  it('registers all default tabs when tabs option is omitted', () => {
    installDevtools();

    const tabs = peekHungpvqDebugHost()?.listTabs('vue') ?? [];
    const ids = tabs.map((t) => t.id);
    expect(ids).toContain('store');
    expect(ids).toContain('live');
    expect(ids).toContain('logs');
    expect(ids).toContain('errors');
  });
});
