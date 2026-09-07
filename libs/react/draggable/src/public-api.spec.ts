/**
 * Locks `@hungpvq/react-draggable` root runtime exports.
 * Stable vs experimental sets are documented on
 * `libs/draggable/core/docs/stable-api.md`.
 */
import { describe, expect, it } from 'vitest';
import * as api from './index';

export const REACT_DRAGGABLE_STABLE_RUNTIME_EXPORTS = [
  'ContainerProvider',
  'DraggableContainer',
  'DraggableDrawer',
  'DraggableItemBottom',
  'DraggableItemFloat',
  'DraggableItemPopup',
  'DraggableItemSideBar',
  'DraggableModal',
  'WithMobileHandle',
  'createEmptyBottom',
  'createEmptyContainer',
  'createEmptyDrawer',
  'createEmptyItemGroup',
  'createEmptySideBar',
  'itemTypeToGroup',
  'useBottomContainer',
  'useBottomItem',
  'useComponent',
  'useContainerId',
  'useContainerOrder',
  'useContainerReactive',
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
  'useStoreReactive',
  'withExpandEmit',
  'withExpandProps',
  'withShareComponent',
  'withShareProps',
  'withShowEmit',
  'withShowProps',
] as const;

/** @experimental — may change in a minor. */
export const REACT_DRAGGABLE_EXPERIMENTAL_RUNTIME_EXPORTS = [
  'ContextMenu',
  'ContextMenuItem',
  'Item',
  'ItemList',
  'ManagementControl',
  'ShowStatusDragItem',
  'ShowStatusDrawer',
  'ShowStatusSideBar',
] as const;

describe('public API surface', () => {
  it('root runtime exports match Stable + Experimental allowlists', () => {
    const keys = Object.keys(api).sort();
    const expected = [
      ...REACT_DRAGGABLE_STABLE_RUNTIME_EXPORTS,
      ...REACT_DRAGGABLE_EXPERIMENTAL_RUNTIME_EXPORTS,
    ].sort();
    expect(keys).toEqual(expected);
  });
});
