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

<style lang="scss">
.hungpvq-draggable-card {
  background-color: var(--card-background-color);
  color: var(--card-color);
  button {
    color: var(--card-color);
  }

  position: relative;
  border: 2px solid transparent;
  overflow: auto;
  padding: 1px;

  &:before,
  &:after {
    content: '';
    position: absolute;
    z-index: 1;
  }

  &:not(.border-0):before {
    left: 15px;
    right: 15px;
    top: 0;
    bottom: 0;
    border-top: 1px solid #fff;
    border-bottom: 1px solid #fff;
    opacity: 0.3;
    background: transparent;
  }

  &:not(.border-0):after {
    top: 15px;
    bottom: 15px;
    left: 0;
    right: 0;
    border-left: 1px solid #fff;
    border-right: 1px solid #fff;
    opacity: 0.3;
    background: transparent;
  }

  &.highlight {
    border: 2px solid var(--card-highlight-background-color);
  }
  &
    > *:not(.card-arrow):not(.card-img-overlay):not(.card-img):not(
      .hljs-container
    ) {
    position: relative;
    z-index: 10;
  }

  & .card-arrow {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
  }

  & .card-arrow-top-left,
  & .card-arrow-top-right,
  & .card-arrow-bottom-left,
  & .card-arrow-bottom-right {
    z-index: 11;
    width: 10px;
    height: 10px;
    position: absolute;

    &:before {
      content: '';
      position: absolute;
      width: 2px;
      height: 8px;
      background: #fff;
      opacity: 0.75;
    }

    &:after {
      content: '';
      position: absolute;
      width: 10px;
      height: 2px;
      background: #fff;
      opacity: 0.75;
    }
  }

  & .card-arrow-top-left,
  & .card-arrow-top-right {
    top: 0;

    &:before {
      top: 2px;
    }

    &:after {
      top: 0;
    }
  }

  & .card-arrow-bottom-left,
  & .card-arrow-bottom-right {
    bottom: 0;

    &:before {
      bottom: 2px;
    }

    &:after {
      bottom: 0;
    }
  }

  & .card-arrow-top-left,
  & .card-arrow-bottom-left {
    left: 0;

    &:before,
    &:after {
      left: 0;
    }
  }

  & .card-arrow-top-right,
  & .card-arrow-bottom-right {
    right: 0;

    &:before,
    &:after {
      right: 0;
    }
  }

  &::before,
  &::after {
    box-sizing: border-box;
    border-width: 0;
    border-style: solid;
    border-color: currentColor;
  }
}

.hungpvq-draggable-card,
.card-container {
  height: 100%;
}
</style>
