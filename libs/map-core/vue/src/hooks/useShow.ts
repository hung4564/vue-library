import { propsFactory } from '@hungpvq/shared';
import { Ref, ref } from 'vue';

export function useShow(
  init = false,
  cbWhenToggle?: (value: boolean) => void,
): [Ref<boolean>, (value?: boolean | string) => void] {
  const show = ref(init);
  function toggleShow(value?: boolean | string) {
    if (value != null) {
      show.value = !!value;
      cbWhenToggle?.(show.value);
      return;
    }
    show.value = !show.value;
    cbWhenToggle?.(show.value);
  }
  return [show, toggleShow];
}

export const makeShowProps = propsFactory(
  {
    show: Boolean,
  },
  'show',
);

export type WithShowProps = { show?: boolean };
