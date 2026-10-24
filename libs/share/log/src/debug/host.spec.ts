import { afterEach, describe, expect, it } from 'vitest';

import {
  ensureHungpvqDebugHost,
  openDebugTab,
  peekHungpvqDebugHost,
  resetHungpvqDebugHostForTests,
} from './host';
import { installDebug, uninstallDebug } from './install';

afterEach(() => {
  uninstallDebug();
  resetHungpvqDebugHostForTests();
});

describe('__hungpvqDebug pin', () => {
  it('creates a stub before installDebug and install adopts the same object', () => {
    const stub = ensureHungpvqDebugHost();
    stub.registerTab({
      id: 'app:demo',
      label: 'Demo',
      order: 5,
      framework: 'vue',
      component: { name: 'DemoTab' },
    });
    installDebug({ logStore: 'memory' });
    expect(peekHungpvqDebugHost()).toBe(stub);
    expect(stub.listTabs('vue').map((t) => t.id)).toContain('app:demo');
  });

  it('replace same id and unregister', () => {
    const host = ensureHungpvqDebugHost();
    host.registerTab({
      id: 'x',
      label: 'One',
      framework: 'vue',
      component: 1,
    });
    host.registerTab({
      id: 'x',
      label: 'Two',
      framework: 'vue',
      component: 2,
    });
    expect(host.listTabs('vue')).toHaveLength(1);
    expect(host.listTabs('vue')[0]?.component).toBe(2);
    host.unregisterTab('x');
    expect(host.listTabs('vue')).toHaveLength(0);
  });

  it('hides tabs and skips openTab when hidden', () => {
    const host = ensureHungpvqDebugHost();
    let hidden = true;
    host.registerTab({
      id: 'secret',
      label: 'Secret',
      framework: 'vue',
      component: {},
      hidden: () => hidden,
    });
    expect(host.listTabs('vue')).toHaveLength(0);
    openDebugTab('secret');
    expect(host.isOpen()).toBe(false);
    hidden = false;
    host.registerTab({
      id: 'secret',
      label: 'Secret',
      framework: 'vue',
      component: {},
      hidden: () => hidden,
    });
    openDebugTab('secret');
    expect(host.isOpen()).toBe(true);
    expect(host.getActiveTab()).toBe('secret');
  });

  it('does not list tabs for the other framework', () => {
    const host = ensureHungpvqDebugHost();
    host.registerTab({
      id: 'vue-only',
      label: 'Vue',
      framework: 'vue',
      component: {},
    });
    expect(host.listTabs('react')).toHaveLength(0);
    expect(host.listTabs('vue')).toHaveLength(1);
  });

  it('optional pin call is a no-op when host is missing', () => {
    expect(peekHungpvqDebugHost()).toBeUndefined();
    peekHungpvqDebugHost()?.registerTab({
      id: 'gone',
      label: 'Gone',
      framework: 'vue',
      component: {},
    });
    expect(peekHungpvqDebugHost()).toBeUndefined();
  });

  it('subscribe fires on register', () => {
    const host = ensureHungpvqDebugHost();
    let n = 0;
    const stop = host.subscribe(() => {
      n += 1;
    });
    host.registerTab({
      id: 's',
      label: 'S',
      framework: 'vue',
      component: {},
    });
    expect(n).toBeGreaterThan(0);
    stop();
  });
});
