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
<style scoped>
.map-icon {
  align-items: center;
  display: inline-flex;
  font-feature-settings: 'liga';
  font-size: 24px;
  justify-content: center;
  letter-spacing: normal;
  line-height: 1;
  position: relative;
  text-indent: 0;
  transition: 0.3s cubic-bezier(0.25, 0.8, 0.5, 1), visibility 0s;
  vertical-align: middle;
  user-select: none;
}
.map-icon {
  height: 18px;
  font-size: 18px;
  width: 18px;
}
</style>
