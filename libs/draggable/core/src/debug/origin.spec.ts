import { describe, expect, it } from 'vitest';

import {
  captureDragOrigin,
  describeDragOrigin,
  dragOriginKey,
  formatDragOrigin,
} from './origin';

describe('captureDragOrigin', () => {
  it('prefers the Vue/React component name', () => {
    const origin = captureDragOrigin({
      hook: 'useInitItem',
      component: 'LayersPage',
      stack: 'Error\n    at useInitItem (x)\n    at createPopup (y)',
    });
    expect(origin).toEqual({
      kind: 'component',
      name: 'LayersPage',
      hook: 'useInitItem',
      caller: 'createPopup',
    });
  });

  it('falls back to the first non-internal stack frame', () => {
    const origin = captureDragOrigin({
      hook: 'useInitSidebar',
      stack:
        'Error\n    at captureDragOrigin (a)\n    at useInitSidebar (b)\n    at openLegend (c)',
    });
    expect(origin).toEqual({
      kind: 'function',
      name: 'openLegend',
      hook: 'useInitSidebar',
      caller: 'openLegend',
    });
  });

  it('treats PascalCase stack frames as components and keeps the file', () => {
    const origin = captureDragOrigin({
      hook: 'useInitItem',
      stack:
        'Error\n    at useInitItem (x)\n    at LayersPage (src/pages/LayersPage.vue:12)',
    });
    expect(origin).toEqual({
      kind: 'component',
      name: 'LayersPage',
      hook: 'useInitItem',
      caller: 'LayersPage',
      file: 'LayersPage.vue:12',
    });
  });

  it('bypasses WithMobileHandle wrappers when guessing origin', () => {
    const origin = captureDragOrigin({
      hook: 'useInitSidebar',
      component: 'WithMobileHandleDraggableItemSideBar',
      stack:
        'Error\n    at WithMobileHandleDraggableItemSideBar (a)\n    at layer-control (src/LayerControl.vue:4)',
    });
    expect(origin.kind).toBe('function');
    expect(origin.name).toBe('layer-control');
    expect(origin.name.includes('WithMobileHandle')).toBe(false);
  });

  it('uses the hook when no caller or component is available', () => {
    const origin = captureDragOrigin({
      hook: 'useInitDrawer',
      stack: 'Error\n    at useInitDrawer (x)',
    });
    expect(origin).toEqual({
      kind: 'hook',
      name: 'useInitDrawer',
      hook: 'useInitDrawer',
    });
  });

  it('formats origin labels and keys', () => {
    expect(formatDragOrigin()).toBe('—');
    expect(
      formatDragOrigin({ kind: 'component', name: 'App', hook: 'useInitItem' }),
    ).toBe('component: App');
    expect(describeDragOrigin({ kind: 'function', name: 'openLegend' })).toBe(
      'created from function openLegend',
    );
    expect(dragOriginKey('c1', 'item')).toBe('c1::item');
  });
});
