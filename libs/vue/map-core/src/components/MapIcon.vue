<template>
  <i class="map-icon mdi" :class="iconName"> </i>
</template>

<script lang="ts">
export default {
  name: 'MapIcon',
  props: {},
  computed: {
    iconName() {
      let iconName = '';
      return iconName;
    },
  },
};
</script>
