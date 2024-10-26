// Utilities

// Types
import type { PropType, StyleValue } from 'vue';
import { propsFactory } from '../utils/propsFactory';

export type ClassValue = any;

export interface ComponentProps {
  class: ClassValue;
  style: StyleValue | undefined;
}

// Composables
export const makeComponentProps = propsFactory(
  {
    class: [String, Array, Object] as PropType<ClassValue>,
    style: {
      type: [String, Array, Object] as PropType<StyleValue>,
      default: null,
    },
  },
  'component'
);
