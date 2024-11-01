import { propsFactory } from '@hungpvq/shared';
import { computed, MaybeRef, PropType, unref } from 'vue';
import { getCurrentInstanceName } from '../utils/getCurrentInstance';
import { useColor } from './color';

export const allowedVariants = ['outlined', 'plain', 'filled'] as const;

export interface VariantProps {
  color?: string;
  variant: Variant;
}
export type Variant = (typeof allowedVariants)[number];

export const makeVariantProps = propsFactory(
  {
    color: String,
    variant: {
      type: String as PropType<Variant>,
      default: 'filled',
      validator: (v: Variant) => allowedVariants.includes(v),
    },
  },
  'variant'
);

export function useVariant(
  props: MaybeRef<VariantProps>,
  name = getCurrentInstanceName()
) {
  const variantClasses = computed(() => {
    const { variant } = unref(props);
    return `${name}--variant-${variant}`;
  });

  const { colorClasses, colorStyles } = useColor(
    computed(() => {
      const { variant, color } = unref(props);
      return {
        [['elevated', 'flat'].includes(variant) ? 'background' : 'text']: color,
      };
    })
  );

  return { colorClasses, colorStyles, variantClasses };
}
