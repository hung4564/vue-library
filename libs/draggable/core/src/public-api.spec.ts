/**
 * Locks the `@hungpvq/draggable` root **runtime** export surface.
 * Type-only exports are documented on `docs/stable-api.md` and listed in
 * `index.ts` — they are erased at runtime and intentionally omitted here.
 *
 * Adding a runtime symbol requires updating this list + Stable docs.
 */
import { describe, expect, it } from 'vitest';
import * as api from './index';

/** Stable root runtime exports (SemVer contract for 1.1.x). */
export const DRAGGABLE_STABLE_RUNTIME_EXPORTS = [
  // factories
  'createEmptyBottom',
  'createEmptyContainer',
  'createEmptyDrawer',
  'createEmptyItemGroup',
  'createEmptySideBar',
  'itemTypeToGroup',
  // store
  'configureDragStore',
  'useBottomItem',
  'useDragCommands',
  'useDragComponent',
  'useDragContainer',
  'useDragIsMobile',
  'useDragItem',
  'useDragLayout',
  'useDragStore',
  'useDrawerItem',
  'useSidebarItem',
  // utils
  'assertDefined',
  'checkIsFirst',
  'checkIsLast',
  'clampBounds',
  'clearMenuTypeahead',
  'focusFirst',
  'getFocusableElements',
  'getMenuItems',
  'handleMenuKeydown',
  'restoreFocus',
  'setModalSiblingsInert',
  'trapTabKey',
] as const;

describe('public API surface', () => {
  it('root runtime exports match Stable allowlist exactly', () => {
    const keys = Object.keys(api).sort();
    const expected = [...DRAGGABLE_STABLE_RUNTIME_EXPORTS].sort();
    expect(keys).toEqual(expected);
  });

  it('exposes store configure + commands used by adapters', () => {
    expect(typeof api.configureDragStore).toBe('function');
    expect(typeof api.useDragCommands).toBe('function');
    expect(typeof api.useDragLayout).toBe('function');
    expect(typeof api.trapTabKey).toBe('function');
  });
});
