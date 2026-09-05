import {
  Component,
  Ref,
  computed,
  defineComponent,
  h,
  inject,
  ref,
} from 'vue';
import { useDragIsMobile } from '../store';

function getComponentName(component: Component): string {
  if (typeof component === 'object' && component && 'name' in component) {
    return String(component.name ?? '');
  }
  if (typeof component === 'function') {
    return component.name || '';
  }
  return '';
}

export function WithMobileHandle<T extends Component>(
  Component: T,
  ComponentMobile: Component,
) {
  return defineComponent({
    name: 'WithMobileHandle' + getComponentName(Component),
    props: {
      containerId: String,
    },
    setup(props) {
      const p_containerId = inject<Ref<string>>(
        'containerId',
        ref(props.containerId || ''),
      );
      const store = useDragIsMobile(p_containerId.value);
      const isMobile = computed(() => store.getIsMobile());
      return { p_containerId, isMobile };
    },
    render() {
      if (this.isMobile) {
        return h(
          ComponentMobile,
          { ...this.$attrs, containerId: this.p_containerId },
          this.$slots,
        );
      }
      return h(
        Component,
        { ...this.$attrs, containerId: this.p_containerId },
        this.$slots,
      );
    },
  }) as T;
}
