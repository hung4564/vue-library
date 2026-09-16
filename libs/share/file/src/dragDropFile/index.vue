<script setup lang="ts">
import { ref } from 'vue';
import { useFileDialog } from '../useFileDialog';
import { useDropZone } from '@hungpvq/shared-core';
const props = defineProps({
  multiple: Boolean,
  accept: String,
  /** Optional async resolver (e.g. folder walk + GIS filter). */
  resolveDropFiles: Function,
});
const emits = defineEmits(['change']);
const { onChange, open } = useFileDialog({
  multiple: props.multiple,
  accept: props.accept,
});
onChange((files) => {
  if (files) onDrop(Array.from(files));
});
function onDrop(files: File[] | null) {
  if (!files?.length) {
    return;
  }
  emits('change', props.multiple ? files : files[0]);
}
const dropZoneRef = ref<HTMLElement>();
const { isOverDropZone } = useDropZone(dropZoneRef, {
  onDrop: (_files, event) => {
    void (async () => {
      if (typeof props.resolveDropFiles === 'function' && event.dataTransfer) {
        const resolved = await props.resolveDropFiles(event.dataTransfer);
        onDrop(Array.isArray(resolved) ? resolved : null);
        return;
      }
      onDrop(Array.from(event.dataTransfer?.files ?? []));
    })();
  },
});
</script>
<template lang="">
  <div
    class="ddf__area"
    ref="dropZoneRef"
    @click="open()"
    :class="{ ddf__active: isOverDropZone }"
  >
    <label class="ddf__label" for="upload-file">
      <i class="ddf__label-inner">
        <svg class="ddf__icon" viewBox="0 0 64 64" aria-hidden="true">
          <path
            fill="currentColor"
            d="M51,27c-.374,0-.742.025-1.109.056a18,18,0,0,0-35.782,0C13.742,27.025,13.374,27,13,27a13,13,0,0,0,0,26H51a13,13,0,0,0,0-26Z"
          ></path>
          <path
            d="M43.764,41.354l-11-13a1.033,1.033,0,0,0-1.526,0l-11,13A1,1,0,0,0,21,43h7V59h8V43h7a1,1,0,0,0,.764-1.646Z"
          ></path>
        </svg>
        <span class="ddf__text"> Drag and drop your files here </span>
        <span class="ddf__subtext"> or click to browse your files </span></i
      >
    </label>
  </div>
</template>
<style lang="scss" scoped>
.ddf {
  &__active {
    border-color: var(--v-primary-base, #1a73e8) !important;
    .ddf__icon {
      color: var(--v-primary-base, #1a73e8) !important;
    }
  }
  &__area {
    position: relative;
    overflow: hidden;
    border-radius: 0.375em;
    border: 2px dashed #a2a2a9;
    transition: 0.3s;
    padding-top: clamp(3.5rem, calc(1.25rem + 4.6875vw), 5rem);
    padding-bottom: clamp(3.5rem, calc(1.25rem + 4.6875vw), 5rem);
    padding-right: clamp(1.5rem, calc(1.125rem + 0.78125vw), 1.75rem);
    padding-left: clamp(1.5rem, calc(1.125rem + 0.78125vw), 1.75rem);
  }
  &__label {
    cursor: pointer;
    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      height: 100%;
      width: 100%;
      cursor: inherit;
    }
  }
  &__label-inner {
    display: flex;
    align-items: center;
    flex-direction: column;
    transition:
      opacity 0.3s,
      transform 0.3s cubic-bezier(0.215, 0.61, 0.355, 1);
  }
  &__icon {
    color: #14151a;
    font-size: 64px;
    height: 1em;
    width: 1em;
    display: inline-block;
    color: inherit;
    fill: currentColor;
    line-height: 1;
    flex-shrink: 0;
    max-width: initial;
    *:nth-child(2) {
      mix-blend-mode: difference;
      transition: fill 0.3s;
      fill: #f2f2f3;
    }
  }
  &__text {
    margin-top: 0.75rem;
    font-weight: 600;
  }
  &__subtext {
    margin-top: 0.25rem;
    opacity: 0.7;
    font-size: 0.875rem;
  }
}
</style>
