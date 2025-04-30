<template>
  <div class="card" :style="cardStyle" v-bind="$attrs">
    <div>
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

<script lang="ts">
export default {
  name: 'MapCard',
  props: {
    height: {
      type: [String, Number],
      default: undefined,
    },
    width: {
      type: [String, Number],
      default: undefined,
    },
  },
  data: () => ({}),
  computed: {
    cardStyle() {
      return { height: this.height, width: this.width };
    },
  },
  methods: {},
};
</script>

<style scoped></style>
