<template>
  <ModuleContainer v-bind="moduleContainerProps">
    <template #draggable="props">
      <DraggableItemPopup
        v-bind="props"
        v-model:show="show"
        title="Edit Field"
        :height="400"
        :width="400"
      >
        <div class="p-4 space-y-4">
          <label class="block text-sm font-medium">Name</label>
          <InputText v-model="form.name" type="text" />

          <div class="button-container">
            <BaseButton @click="save"> Save </BaseButton>
            <BaseButton @click="cancel"> Cancel </BaseButton>
          </div>
        </div>
      </DraggableItemPopup>
    </template>
    <slot />
  </ModuleContainer>
</template>

<script setup lang="ts">
import { DraggableItemPopup } from '@hungpvq/vue-draggable';
import {
  BaseButton,
  defaultMapProps,
  InputText,
  ModuleContainer,
  useMap,
  useShow,
  WithMapPropType,
} from '@hungpvq/vue-map-core';
import { ref } from 'vue';
const props = withDefaults(defineProps<WithMapPropType>(), {
  ...defaultMapProps,
});
const [show, setShow] = useShow(false);
const { moduleContainerProps } = useMap(props);

interface FormData {
  name: string;
}

const form = ref<FormData>({
  name: '',
});

let _resolve: ((value: FormData) => void) | null = null;
let _reject: ((reason?: any) => void) | null = null;

function open(data: Partial<FormData>) {
  form.value = { ...form.value, ...data };
  setShow(true);
  return new Promise<FormData>((resolve, reject) => {
    _resolve = resolve;
    _reject = reject;
  });
}

function cancel() {
  if (_reject) _reject('cancel');
  setShow(false);
}

function save() {
  if (_resolve) _resolve({ ...form.value });
  setShow(false);
}

defineExpose({ open });
</script>

<style scoped>
.button-container {
  display: flex;
  flex: 0 0 auto;
  flex-direction: column;
  gap: 4px;
}
.button-container > * {
  width: 100%;
  padding: 8px;
}
</style>
