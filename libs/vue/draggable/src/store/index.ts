import {
  configureDragStore,
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
