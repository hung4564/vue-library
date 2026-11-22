import {
  configureDragStore,
  type DragStoreMakeReactive,
} from '@hungpvq/draggable';
import { reactive } from 'vue';

const makeReactive: DragStoreMakeReactive = (value) =>
  reactive(value) as typeof value;

configureDragStore({ makeReactive });
