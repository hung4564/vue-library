import { computed, ref, watch } from 'vue';

export function useShow(props: any, emit: any, init?: boolean) {
  const p_show = ref<boolean>(!!props.show || !!init);
  watch(
    () => props.show,
    (value) => {
      p_show.value = value;
    }
  );
  const show = computed({
    get() {
      return p_show.value;
    },
    set(val) {
      p_show.value = val;
      emit('update:show', val);
      if (!val) {
        emit('close');
      }
    },
  });
  return { show };
}
export const withShowProps = {
  show: Boolean,
};

export const withShowEmit = {
  'update:show': (value: boolean) => Boolean,
  close: () => Boolean,
};
export function useExpand(props: any, emit: any, init?: boolean) {
  const p_expand = ref<boolean>(!!init);
  watch(
    () => props.expand,
    (value) => {
      p_expand.value = value;
    }
  );
  const expand = computed({
    get() {
      return p_expand.value;
    },
    set(val) {
      p_expand.value = val;
      emit('update:expand', val);
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
  'update:expand': (_value: boolean) => Boolean,
};
