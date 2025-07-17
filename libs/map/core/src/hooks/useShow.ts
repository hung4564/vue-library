import { propsFactory } from '@hungpvq/shared';
import { Ref, ref } from 'vue';

export function useShow(
  init = false,
  // eslint-disable-next-line no-unused-vars
): [Ref<boolean>, (value?: boolean | string) => void] {
  const show = ref(init);
  function toggleShow(value?: boolean | string) {
    if (value != null) {
      show.value = !!value;
      return;
    }
    show.value = !show.value;
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
