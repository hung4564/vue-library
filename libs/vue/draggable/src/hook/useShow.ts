import { computed, ref, watch } from 'vue';

/**
 * Accept Vue `defineEmits` call signatures. Typed emits are narrower than
 * `(event: string, …)` and fail under strictFunctionTypes; the bivariance
 * hack matches DOM EventListener / React SyntheticEvent patterns.
 */
type LooseEmit = {
  bivarianceHack(event: string, ...args: unknown[]): void;
}['bivarianceHack'] | null;
type ShowProps = {
  show?: boolean;
  [key: string]: unknown;
};
type ExpandProps = {
  expand?: boolean;
  [key: string]: unknown;
};

/**
 * Visibility vs dismiss:
 * - `show` / `update:show` — hide/show only (toggle, exclusive bottom/sidebar).
 * - `close()` — dismiss request (X / Escape / management Hide); emits `close`.
 */
export function useShow(props: ShowProps, emit?: LooseEmit, init?: boolean) {
  const p_show = ref<boolean>(!!props.show || !!init);
  watch(
    () => props.show,
    (value) => {
      if (value !== undefined) {
        p_show.value = value;
      }
    },
  );
  const show = computed({
    get() {
      return p_show.value;
    },
    set(val) {
      if (p_show.value === val) return;
      p_show.value = val;
      emit && emit('update:show', val);
    },
  });
  function open() {
    show.value = true;
  }
  function close() {
    const wasOpen = p_show.value;
    p_show.value = false;
    if (wasOpen) {
      emit && emit('update:show', false);
    }
    emit && emit('close');
  }
  return { show, open, close };
}
export const withShowProps = {
  show: Boolean,
};

export const withShowEmit = {
  'update:show': (value: boolean) => typeof value === 'boolean',
  close: () => true,
};
export function useExpand(
  props: ExpandProps,
  emit?: LooseEmit,
  init?: boolean,
) {
  const p_expand = ref<boolean>(!!init);
  watch(
    () => props.expand,
    (value) => {
      if (value !== undefined) {
        p_expand.value = value;
      }
    },
  );
  const expand = computed({
    get() {
      return p_expand.value;
    },
    set(val) {
      p_expand.value = val;
      emit && emit('update:expand', val);
    },
  });
  function toggle() {
    expand.value = !expand.value;
  }
  return { expand, toggle };
}
export const withExpandProps = {
  expand: Boolean,
};

export const withExpandEmit = {
  'update:expand': (value: boolean) => typeof value === 'boolean',
};

export const useHighlight = (ms = 5000) => {
  const isHighlight = ref(false);
  let timeout: ReturnType<typeof setTimeout> | null = null;
  const setHighLight = (highlight?: boolean) => {
    const newValue = highlight !== undefined ? highlight : !isHighlight.value;
    isHighlight.value = newValue;
    if (timeout) {
      clearTimeout(timeout);
      timeout = null;
    }
    if (newValue) {
      timeout = setTimeout(() => {
        isHighlight.value = false;
        timeout = null;
      }, ms);
    }
  };
  return { isHighlight, setHighLight };
};
