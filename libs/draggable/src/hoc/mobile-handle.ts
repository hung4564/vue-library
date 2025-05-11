import { Component, Ref, computed, defineComponent, h, inject, ref } from 'vue';
import { useDragStore } from '../store';

export function WithMobileHandle<T = Component>(
  Component: T,
  ComponentMobile: any,
) {
  return defineComponent({
    name: 'WithMobileHandle' + (Component as any).name,
    props: {
      containerId: String,
    },
    setup(props) {
      const p_containerId = inject<Ref<string>>(
        'containerId',
        ref(props.containerId || ''),
      );
      const store = useDragStore(p_containerId.value);
      const isMobile = computed(() => store.getters.getIsMobile());
      return { p_containerId, isMobile };
    },
    render() {
      if (this.isMobile) {
        return h(
          ComponentMobile as any,
          { ...this.$attrs, containerId: this.p_containerId },
          this.$slots,
        );
      }
      return h(
        Component as any,
        { ...this.$attrs, containerId: this.p_containerId },
        this.$slots,
      );
    },
  }) as T;
}
