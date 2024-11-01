import { defineComponent, h } from 'vue';
import { makeComponentProps } from '../../composables/component';
import { makeTagProps } from '../../composables/tag';

const VListItem = defineComponent({
  props: {
    ...makeComponentProps(),
    ...makeTagProps({ tag: 'li' }),
  },
  name: 'v-list-item',
  setup(props, ctx) {
    return () =>
      h(
        props.tag,
        {
          class: ['v-list-item', props.class],
          style: props.style,
        },
        ctx.slots.default && ctx.slots.default()
      );
  },
});
export default VListItem;
export { VListItem };
