<template>
  <div class="base-map-add-form" @click.stop>
    <div class="base-map-add-form__body">
      <div v-if="showHeading" class="base-map-add-form__title">
        {{ trans('map.basemap.add') }}
      </div>
      <InputText
        v-model="title"
        :label="trans('map.basemap.add-title')"
        @update:model-value="invalidateCheck"
      />
      <InputSelect
        v-model="type"
        :label="trans('map.basemap.add-type')"
        :items="typeItems"
        item-value="value"
        item-text="text"
        @update:model-value="invalidateCheck"
      />
      <InputText
        v-model="url"
        :label="trans('map.basemap.add-url')"
        :placeholder="urlHint"
        @update:model-value="invalidateCheck"
      />
      <div
        v-if="statusMessage"
        class="base-map-add-form__status"
        :class="{
          'base-map-add-form__status--ok': checkOk,
          'base-map-add-form__status--err': checkOk === false,
        }"
      >
        {{ statusMessage }}
      </div>
    </div>
    <div class="base-map-add-form__actions">
      <MapControlButton
        variant="text"
        size="small"
        :disabled="checking || !canCheck"
        @click="onCheck"
      >
        {{ checking ? trans('map.basemap.add-checking') : trans('map.basemap.add-check') }}
      </MapControlButton>
      <MapControlButton
        variant="text"
        size="small"
        :disabled="!checkOk || checking"
        @click="onSubmit"
      >
        {{ trans('map.basemap.add-submit') }}
      </MapControlButton>
      <MapControlButton variant="text" size="small" @click="$emit('cancel')">
        {{ trans('map.basemap.add-cancel') }}
      </MapControlButton>
    </div>
  </div>
</template>
<script setup lang="ts">
import {
  createCustomBasemapItem,
  validateBasemapSource,
  type BaseMapItem,
  type BasemapSourceType,
} from '@hungpvq/map-core/basemap';
import { computed, ref } from 'vue';
import MapControlButton from '../../../components/MapControlButton.vue';
import { useLang } from '../../../extra/lang/hook';
import { InputSelect, InputText } from '../../../field';
import { useMap } from '../../../hooks/useMap';

const props = withDefaults(
  defineProps<{
    mapId: string;
    /** Thumbnail for new items (e.g. none basemap thumb). */
    thumbnail?: string;
    /** Show the in-form heading (hide when the host popup already titles the panel). */
    showHeading?: boolean;
  }>(),
  {
    thumbnail: '',
    showHeading: true,
  },
);

const emit = defineEmits<{
  added: [item: BaseMapItem];
  cancel: [];
}>();

const { mapId } = useMap({ mapId: props.mapId });
const { trans } = useLang(mapId.value);

const title = ref('');
const url = ref('');
const type = ref<BasemapSourceType>('raster');
const checking = ref(false);
const checkOk = ref<boolean | null>(null);
const statusMessage = ref('');

const typeItems = computed(() => [
  { value: 'raster' as const, text: trans.value('map.basemap.add-type-raster') },
  { value: 'vector' as const, text: trans.value('map.basemap.add-type-vector') },
]);

const urlHint = computed(() =>
  type.value === 'vector'
    ? trans.value('map.basemap.add-url-hint-vector')
    : trans.value('map.basemap.add-url-hint-raster'),
);

const canCheck = computed(
  () => title.value.trim().length > 0 && url.value.trim().length > 0,
);

function invalidateCheck() {
  checkOk.value = null;
  statusMessage.value = '';
}

async function onCheck() {
  if (!canCheck.value || checking.value) return;
  checking.value = true;
  statusMessage.value = '';
  checkOk.value = null;
  try {
    const result = await validateBasemapSource({
      type: type.value,
      url: url.value,
    });
    if (result.ok) {
      checkOk.value = true;
      statusMessage.value = trans.value('map.basemap.add-check-ok');
    } else {
      checkOk.value = false;
      statusMessage.value =
        result.message || trans.value('map.basemap.add-check-fail');
    }
  } finally {
    checking.value = false;
  }
}

function onSubmit() {
  if (!checkOk.value) return;
  const item = createCustomBasemapItem({
    title: title.value,
    type: type.value,
    url: url.value,
    thumbnail: props.thumbnail ?? '',
  });
  emit('added', item);
}
</script>
