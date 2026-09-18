<script lang="ts">
export default { name: 'DragDropFile' };
</script>
<script setup lang="ts">
import { ref } from 'vue';

const props = withDefaults(
  defineProps<{
    accept?: string;
    multiple?: boolean;
    /** Optional async resolver (e.g. folder walk + GIS filter). */
    resolveDropFiles?: (dataTransfer: DataTransfer) => Promise<File[]>;
  }>(),
  {
    accept: '*',
    multiple: false,
  },
);

const emit = defineEmits<{
  change: [file: File | File[]];
}>();

const isOverDropZone = ref(false);
const dragCounter = ref(0);
const inputRef = ref<HTMLInputElement | null>(null);

function emitFiles(files: File[] | null) {
  if (!files?.length) return;
  emit('change', props.multiple ? files : files[0]);
}

function open() {
  if (!inputRef.value) {
    const input = document.createElement('input');
    input.type = 'file';
    input.onchange = (event) => {
      const list = (event.target as HTMLInputElement).files;
      if (list?.length) emitFiles(Array.from(list));
      input.value = '';
    };
    inputRef.value = input;
  }
  inputRef.value.accept = props.accept ?? '*';
  inputRef.value.multiple = props.multiple;
  inputRef.value.click();
}

function onKeyDown(event: KeyboardEvent) {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault();
    open();
  }
}

function onDragEnter(event: DragEvent) {
  event.preventDefault();
  dragCounter.value += 1;
  isOverDropZone.value = true;
}

function onDragLeave(event: DragEvent) {
  event.preventDefault();
  dragCounter.value -= 1;
  if (dragCounter.value <= 0) {
    dragCounter.value = 0;
    isOverDropZone.value = false;
  }
}

function onDragOver(event: DragEvent) {
  event.preventDefault();
}

function onDrop(event: DragEvent) {
  event.preventDefault();
  dragCounter.value = 0;
  isOverDropZone.value = false;
  void (async () => {
    if (props.resolveDropFiles && event.dataTransfer) {
      emitFiles(await props.resolveDropFiles(event.dataTransfer));
      return;
    }
    emitFiles(Array.from(event.dataTransfer?.files ?? []));
  })();
}
</script>

<template>
  <div
    class="ddf__area"
    :class="{ ddf__active: isOverDropZone }"
    role="button"
    tabindex="0"
    @click="open"
    @keydown="onKeyDown"
    @dragenter="onDragEnter"
    @dragleave="onDragLeave"
    @dragover="onDragOver"
    @drop="onDrop"
  >
    <label class="ddf__label">
      <span class="ddf__label-inner">
        <svg class="ddf__icon" viewBox="0 0 64 64" aria-hidden="true">
          <path
            fill="currentColor"
            d="M51,27c-.374,0-.742.025-1.109.056a18,18,0,0,0-35.782,0C13.742,27.025,13.374,27,13,27a13,13,0,0,0,0,26H51a13,13,0,0,0,0-26Z"
          />
          <path
            d="M43.764,41.354l-11-13a1.033,1.033,0,0,0-1.526,0l-11,13A1,1,0,0,0,21,43h7V59h8V43h7a1,1,0,0,0,.764-1.646Z"
          />
        </svg>
        <span class="ddf__text">Drag and drop your files here</span>
        <span class="ddf__subtext">or click to browse your files</span>
      </span>
    </label>
  </div>
</template>

<style lang="scss" scoped>
.ddf {
  &__active {
    border-color: var(--map-accent-color, #1a73e8) !important;
    .ddf__icon {
      color: var(--map-accent-color, #1a73e8) !important;
    }
  }
  &__area {
    position: relative;
    overflow: hidden;
    border-radius: 0.375em;
    border: 2px dashed var(--map-border-color, #a2a2a9);
    transition: 0.3s;
    padding-top: clamp(3.5rem, calc(1.25rem + 4.6875vw), 5rem);
    padding-bottom: clamp(3.5rem, calc(1.25rem + 4.6875vw), 5rem);
    padding-right: clamp(1.5rem, calc(1.125rem + 0.78125vw), 1.75rem);
    padding-left: clamp(1.5rem, calc(1.125rem + 0.78125vw), 1.75rem);
    color: inherit;
    background: transparent;
    outline: none;
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
