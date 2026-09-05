import {
  configureDragStore,
  useDragComponent,
  useDragContainer,
  useDragIsMobile,
  useDragItem,
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
  useDragComponent,
  useDragContainer,
  useDragIsMobile,
  useDragItem,
  useDragStore,
  useDrawerItem,
  useSidebarItem,
};
