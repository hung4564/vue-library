<template>
  <div class="map-image">
    <div class="map-image__sizer" style="padding-bottom: 100%"></div>
    <div class="map-image__image" :style="styleImage"></div>
    <div class="map-image__content"><slot /></div>
  </div>
</template>

<script>
export default {
  name: 'MapImage',
  props: {
    src: {},
  },
  data: () => ({}),
  computed: {
    styleImage() {
      if (!this.src) {
        return {};
      }
      return {
        'background-image': `url(${this.src})`,
      };
    },
  },
  methods: {},
};
</script>
