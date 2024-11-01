import { defineComponent, h } from 'vue';
import { makeComponentProps } from '../../composables/component';
import { makeSizeProps, useSize } from '../../composables/size';
import { makeTagProps } from '../../composables/tag';
import './VList.scss';
const VList = defineComponent({
  props: {
    ...makeComponentProps(),
    ...makeTagProps({ tag: 'ul' }),
    ...makeSizeProps({ size: 'l' }),
  },
  name: 'v-list',
  setup(props, ctx) {
    const { sizeClasses, sizeStyles } = useSize(props);
    return () =>
      h(
        props.tag,
        {
          class: ['v-list', sizeClasses.value, props.class],
          style: [sizeStyles.value, props.style],
        },
        ctx.slots.default && ctx.slots.default()
      );
  },
});
export default VList;
export { VList };
