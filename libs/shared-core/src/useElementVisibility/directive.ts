import { directiveHooks } from '@hungpvq/shared';
import type { DirectiveBinding, ObjectDirective } from 'vue';
import { watch } from 'vue';

import type { UseElementVisibilityOptions } from '.';
import { useElementVisibility } from '.';

type BindingValueFunction = (state: boolean) => void;

type BindingValueArray = [BindingValueFunction, UseElementVisibilityOptions];

export const vElementVisibility: ObjectDirective<
  HTMLElement,
  BindingValueFunction | BindingValueArray
> = {
  [directiveHooks.mounted](
    el: HTMLElement,
    binding: DirectiveBinding<BindingValueFunction | BindingValueArray>
  ) {
    if (typeof binding.value === 'function') {
      const handler = binding.value;
      const isVisible = useElementVisibility(el);
      watch(isVisible, (v) => handler(v), { immediate: true });
    } else {
      const [handler, options] = binding.value;
      const isVisible = useElementVisibility(el, options);
      watch(isVisible, (v) => handler(v), { immediate: true });
    }
  },
};
