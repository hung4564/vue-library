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
  emitLiveRecord,
  getLiveTraceEvents,
  resetLiveTraceForTests,
  subscribeLiveTrace,
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

    emitLiveRecord({
      framework: 'vue',
      event: 'component:mount',
      instanceId: 'vue:1',
      component: 'Demo',
      renderCount: 1,
    });
    emitLiveRecord({
      framework: 'vue',
      event: 'component:render',
      instanceId: 'vue:1',
      component: 'Demo',
      renderCount: 1,
    });
    emitLiveRecord({
      framework: 'vue',
      event: 'component:update',
      instanceId: 'vue:1',
      component: 'Demo',
      renderCount: 2,
    });
    emitLiveRecord({
      framework: 'vue',
      event: 'component:unmount',
      instanceId: 'vue:1',
      component: 'Demo',
      renderCount: 2,
    });

    expect(getLiveTraceEvents().map((e) => e.data.event)).toEqual([
      'component:unmount',
      'component:update',
      'component:render',
      'component:mount',
    ]);
    expect(getLiveTraceEvents()[0]?.header.kind).toBe('live');
    expect(getLiveTraceEvents()[0]?.id).toBeTruthy();
    expect(ticks).toBe(4);
    stop();
  });

  it('trackLiveEventAction traces change then runs', () => {
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
    expect(last?.data.event).toBe('component:update');
    expect(last?.data.component).toBe('DraggableItemPopup');
    expect(last?.header.span).toBe('open');
    expect(last?.data.changes?.[0]).toMatchObject({
      key: 'open',
      previousValue: false,
      nextValue: true,
    });
  });
});
