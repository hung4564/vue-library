<template>
  <div
    :style="cardStyle"
    v-bind="$attrs"
    :class="{ 'hungpvq-draggable-card': true, highlight }"
  >
    <div class="card-container">
      <slot />
    </div>
    <div class="card-arrow">
      <div class="card-arrow-top-left"></div>
      <div class="card-arrow-top-right"></div>
      <div class="card-arrow-bottom-left"></div>
      <div class="card-arrow-bottom-right"></div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    height: {},
    width: {},
    highlight: {
      type: Boolean,
      default: false,
    },
  },
  name: 'MapCard',
  data: () => ({}),
  computed: {
    cardStyle() {
      return { height: this.height, width: this.width };
    },
  },
  methods: {},
};
</script>
