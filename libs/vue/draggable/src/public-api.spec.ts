/**
 * Locks `@hungpvq/vue-draggable` root runtime exports.
 * Stable vs experimental sets are documented on
 * `libs/draggable/core/docs/stable-api.md`.
 */
import { describe, expect, it } from 'vitest';
import * as api from './index';

export const VUE_DRAGGABLE_STABLE_RUNTIME_EXPORTS = [
  'DraggableContainer',
  'DraggableDrawer',
  'DraggableItemBottom',
  'DraggableItemFloat',
  'DraggableItemPopup',
  'DraggableItemSideBar',
  'DraggableModal',
  'WithMobileHandle',
  'useBottomContainer',
  'useBottomItem',
  'useComponent',
  'useContainerOrder',
  'useContainerSize',
  'useDragCommands',
  'useDragComponent',
  'useDragContainer',
  'useDragIsMobile',
  'useDragItem',
  'useDragLayout',
  'useDragStore',
  'useDrawerItem',
  'useExpand',
  'useHighlight',
  'useIcon',
  'useInitAction',
  'useInitBottom',
  'useInitDrawer',
  'useInitItem',
  'useInitSidebar',
  'useManagement',
  'useShow',
  'useSideBarContainer',
  'useSidebarItem',
  'withExpandEmit',
  'withExpandProps',
  'withShareComponent',
  'withShareProps',
  'withShowEmit',
  'withShowProps',
] as const;

/** @experimental — may change in a minor. */
export const VUE_DRAGGABLE_EXPERIMENTAL_RUNTIME_EXPORTS = [
  'ContextMenu',
  'ContextMenuItem',
  'ManagementControl',
] as const;

describe('public API surface', () => {
  it('root runtime exports match Stable + Experimental allowlists', () => {
    const keys = Object.keys(api).sort();
    const expected = [
      ...VUE_DRAGGABLE_STABLE_RUNTIME_EXPORTS,
      ...VUE_DRAGGABLE_EXPERIMENTAL_RUNTIME_EXPORTS,
    ].sort();
    expect(keys).toEqual(expected);
  });
});
