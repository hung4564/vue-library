<template>
  <div class="collapse collapse-item" :class="{ 'is-active': active }">
    <div
      class="collapse-header touchable"
      role="tab"
      :aria-expanded="active ? 'true' : 'false'"
      @click.prevent="toggle"
    >
      <div class="collapse-header__title">
        <slot name="header"></slot>
      </div>
      <div class="collapse-header__icon">
        <SvgIcon size="14" type="mdi" :path="path.close" v-if="active" />

        <SvgIcon size="14" type="mdi" :path="path.open" v-else />
      </div>
    </div>
    <transition name="fade">
      <div class="collapse-content" v-if="active">
        <div class="collapse-content-box">
          <slot></slot>
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
export default {
  // eslint-disable-next-line vue/multi-word-component-names
  name: 'Collapse',
};
</script>
<script setup>
import SvgIcon from '@jamescoyle/vue-icon';
import { mdiMenuDown, mdiMenuUp } from '@mdi/js';
import { ref } from 'vue';
const props = defineProps({
  selected: {
    type: Boolean,
    default: true,
  },
});
const emit = defineEmits(['update:selected', 'open', 'close']);
const active = ref(props.selected);
const toggle = () => {
  active.value = !active.value;
  emit('update:selected', active.value);
  if (active.value) {
    emit('open');
  } else {
    emit('close');
  }
};
const path = {
  open: mdiMenuDown,
  close: mdiMenuUp,
};
</script>
