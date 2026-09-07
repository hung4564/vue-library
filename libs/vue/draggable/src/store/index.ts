import {
  configureDragStore,
  useBottomItem,
  useDragCommands,
  useDragComponent,
  useDragContainer,
  useDragIsMobile,
  useDragItem,
  useDragLayout,
  useDragStore,
  useDrawerItem,
  useSidebarItem,
  type DragStoreMakeReactive,
} from '@hungpvq/draggable';
import { reactive } from 'vue';

const makeReactive: DragStoreMakeReactive = (value) =>
  reactive(value) as typeof value;

configureDragStore({ makeReactive });

export {
  useBottomItem,
  useDragCommands,
  useDragComponent,
  useDragContainer,
  useDragIsMobile,
  useDragItem,
  useDragLayout,
  useDragStore,
  useDrawerItem,
  useSidebarItem,
};
