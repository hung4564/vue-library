import { propsFactory } from '@hungpvq/shared';
import { includes } from 'lodash';
import { getCurrentInstanceName } from '../utils/getCurrentInstance';
import { convertToUnit, destructComputed } from '../utils/helpers';

// Types
const predefinedSizes = ['xs', 's', 'm', 'l', 'xl'];

export interface SizeProps {
  size?: string | number;
}

// Composables
export const makeSizeProps = propsFactory(
  {
    size: {
      type: [String, Number],
      default: 'm',
    },
  },
  'size'
);

export function useSize(props: SizeProps, name = getCurrentInstanceName()) {
  return destructComputed(() => {
    let sizeClasses;
    let sizeStyles;
    if (includes(predefinedSizes, props.size)) {
      sizeClasses = `${name}--size-${props.size}`;
    } else if (props.size) {
      sizeStyles = {
        width: convertToUnit(props.size),
        height: convertToUnit(props.size),
      };
    }
    return { sizeClasses, sizeStyles };
  });
}
