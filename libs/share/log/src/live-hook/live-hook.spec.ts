import { afterEach, describe, expect, it } from 'vitest';

import {
  getRegisteredInstances,
  registerInstance,
  resetInstanceRegistryForTests,
  subscribeInstances,
  unregisterInstance,
} from '../core/instance-registry';
import { trackLiveEventAction } from './track-action';
import {
  getLiveTraceEvents,
  resetLiveTraceForTests,
  subscribeLiveTrace,
  traceLiveEvent,
} from './trace-store';

afterEach(() => {
  resetInstanceRegistryForTests();
  resetLiveTraceForTests();
});

describe('live-hook registry', () => {
  it('tracks parent/child tree and unregisters', () => {
    const parentTok = {};
    const childTok = {};
    const parent = registerInstance(parentTok, {
      framework: 'vue',
      component: 'Parent',
    });
    const child = registerInstance(childTok, {
      framework: 'vue',
      component: 'Child',
      parentId: parent.id,
      parent: parent.component,
    });

    const tree = getRegisteredInstances();
    expect(tree.map((row) => row.component)).toEqual(['Parent', 'Child']);
    expect(child.parentId).toBe(parent.id);

    let notified = 0;
    const stop = subscribeInstances(() => {
      notified += 1;
    });
    unregisterInstance(childTok);
    expect(getRegisteredInstances()).toHaveLength(1);
    expect(notified).toBeGreaterThan(0);
    unregisterInstance(parentTok);
    expect(getRegisteredInstances()).toHaveLength(0);
    stop();
  });
});

describe('live-hook trace', () => {
  it('records mount / render / update / unmount', () => {
    let ticks = 0;
    const stop = subscribeLiveTrace(() => {
      ticks += 1;
    });

    traceLiveEvent({
      framework: 'vue',
      event: 'component:mount',
      instanceId: 'vue:1',
      component: 'Demo',
      renderCount: 1,
    });
    traceLiveEvent({
      framework: 'vue',
      event: 'component:render',
      instanceId: 'vue:1',
      component: 'Demo',
      renderCount: 1,
    });
    traceLiveEvent({
      framework: 'vue',
      event: 'component:update',
      instanceId: 'vue:1',
      component: 'Demo',
      renderCount: 2,
    });
    traceLiveEvent({
      framework: 'vue',
      event: 'component:unmount',
      instanceId: 'vue:1',
      component: 'Demo',
      renderCount: 2,
    });

    expect(getLiveTraceEvents().map((e) => e.event)).toEqual([
      'component:unmount',
      'component:update',
      'component:render',
      'component:mount',
    ]);
    expect(ticks).toBe(4);
    stop();
  });

  it('trackLiveEventAction traces show change then runs', () => {
    const parentTok = {};
    registerInstance(parentTok, {
      framework: 'vue',
      component: 'DraggableItemPopup',
    });

    let ran = false;
    trackLiveEventAction('DraggableItemPopup')(
      { action: 'open', previousValue: false, nextValue: true },
      () => {
        ran = true;
      },
    );

    expect(ran).toBe(true);
    const last = getLiveTraceEvents()[0];
    expect(last?.event).toBe('component:update');
    expect(last?.component).toBe('DraggableItemPopup');
    expect(last?.cause).toBe('open');
    expect(last?.changes?.[0]).toMatchObject({
      key: 'show',
      previousValue: false,
      nextValue: true,
    });
  });
});
