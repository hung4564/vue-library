import { directiveHooks } from '@hungpv97/shared';
import type { DirectiveBinding, ObjectDirective } from 'vue';
import type { OnClickOutsideHandler, OnClickOutsideOptions } from '.';
import { onClickOutside } from '.';

export const vOnClickOutside: ObjectDirective<
  HTMLElement,
  OnClickOutsideHandler | [(evt: any) => void, OnClickOutsideOptions]
> = {
  [directiveHooks.mounted](
    el: HTMLElement,
    binding: DirectiveBinding<
      OnClickOutsideHandler | [(evt: any) => void, OnClickOutsideOptions]
    >
  ) {
    const capture = !binding.modifiers.bubble;
    if (typeof binding.value === 'function') {
      (el as any).__onClickOutside_stop = onClickOutside(el, binding.value, {
        capture,
      });
    } else {
      const [handler, options] = binding.value;
      (el as any).__onClickOutside_stop = onClickOutside(
        el,
        handler,
        Object.assign({ capture }, options)
      );
    }
  },
  [directiveHooks.unmounted](el: HTMLElement) {
    (el as any).__onClickOutside_stop();
  },
};

// alias
export { vOnClickOutside as VOnClickOutside };
