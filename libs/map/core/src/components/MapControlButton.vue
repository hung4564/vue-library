<template>
  <MapButton
    v-if="isGroup"
    v-bind="$attrs"
    :active="active"
    :height="groupSize"
    :title="tooltip || title"
    :width="groupSize"
    :disabled="disabled"
  >
    <slot>
      <MapIcon>
        {{ icon }}
      </MapIcon>
    </slot>
  </MapButton>
  <div v-else class="button-container">
    <div :title="tooltip || title">
      <slot name="content">
        <MapButton
          v-bind="$attrs"
          :active="active"
          :height="size"
          :loading="loading"
          :width="size"
          :disabled="disabled"
        >
          <slot>
            <MapIcon>
              {{ icon }}
            </MapIcon>
          </slot>
        </MapButton>
      </slot>
    </div>
  </div>
</template>

<script>
import MapButton from './MapButton.vue';
import MapIcon from './MapIcon.vue';
export default {
  name: 'MapControlButton',
  components: { MapButton, MapIcon },
  props: {
    icon: {
      type: [String, Boolean],
    },
    tooltip: String,
    title: String,
    loading: Boolean,
    size: { type: Number, default: 32 },
    active: Boolean,
    disabled: Boolean,
  },
  inject: {
    isGroup: { default: false },
    groupSize: { default: 0, from: 'size' },
  },
  computed: {},
};
</script>

<style scoped>
.button-container {
  position: relative;
}
</style>
