import { directiveHooks } from '@hungpv97/shared';
import type { DirectiveBinding, ObjectDirective } from 'vue';
import type { UseIntersectionObserverOptions } from '.';
import { useIntersectionObserver } from '.';

type BindingValueFunction = IntersectionObserverCallback;

type BindingValueArray = [BindingValueFunction, UseIntersectionObserverOptions];

export const vIntersectionObserver: ObjectDirective<
  HTMLElement,
  BindingValueFunction | BindingValueArray
> = {
  [directiveHooks.mounted](
    el: HTMLElement,
    binding: DirectiveBinding<BindingValueFunction | BindingValueArray>
  ) {
    if (typeof binding.value === 'function')
      useIntersectionObserver(el, binding.value);
    else useIntersectionObserver(el, ...binding.value);
  },
};
