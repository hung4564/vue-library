// Utilities

import { propsFactory } from '@hungpvq/shared';

// Types
export interface TagProps {
  tag: string;
}

// Composables
export const makeTagProps = propsFactory(
  {
    tag: {
      type: String,
      default: 'div',
    },
  },
  'tag'
);
