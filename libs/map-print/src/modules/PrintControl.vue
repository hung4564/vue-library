<script setup lang="ts">
import {
  MapControlButton,
  ModuleContainer,
  useLang,
  useMap,
  withMapProps,
} from '@hungpvq/vue-map-core';
import SvgIcon from '@jamescoyle/vue-icon';
import { mdiClose, mdiContentSaveOutline, mdiPrinterOutline } from '@mdi/js';
import { saveAs } from 'file-saver';
import { ref } from 'vue';
import { exportMapbox } from './print';
const props = defineProps({
  ...withMapProps,
  fileName: { type: String, default: 'map' },
});
const path = {
  print: mdiPrinterOutline,
  close: mdiClose,
  save: mdiContentSaveOutline,
};
const { callMap, mapId, moduleContainerProps } = useMap(props);
const { trans, setLocale } = useLang(mapId.value);
setLocale({
  map: {
    print: {
      title: 'Print',
      actions: { save: 'save', clear: 'clear' },
    },
  },
});
const print = ref({ show: false, loading: false });
function onSaveAll(cb?: (image: string) => Promise<void>) {
  callMap(async (map) => {
    print.value.loading = true;
    try {
      let image = await exportMapbox(map);
      if (cb) {
        cb(image);
      } else await onDownload(image);
    } finally {
      print.value.loading = false;
    }
  });
}

async function onDownload(data64: string) {
  saveAs(data64, `${props.fileName}.png`);
}
</script>
<template>
  <ModuleContainer v-bind="moduleContainerProps">
    <template #btn>
      <MapControlButton
        :tooltip="trans('map.print.title')"
        @click.stop="onSaveAll(onDownload)"
        :loading="print.loading"
      >
        <SvgIcon :size="18" type="mdi" :path="path.print" />
      </MapControlButton>
    </template>
  </ModuleContainer>
</template>
