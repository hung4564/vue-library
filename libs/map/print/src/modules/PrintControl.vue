<script setup lang="ts">
import {
  defaultMapProps,
  MapCommonButton,
  ModuleContainer,
  useLang,
  useMap,
  useToolbarControl,
  WithMapPropType,
} from '@hungpvq/vue-map-core';
import { mdiClose, mdiContentSaveOutline, mdiPrinterOutline } from '@mdi/js';
import { saveAs } from 'file-saver';
import { ref } from 'vue';
import { exportMapbox } from './print';
const props = withDefaults(
  defineProps<
    WithMapPropType & {
      fileName?: string;
    }
  >(),
  {
    ...defaultMapProps,
    fileName: 'map',
  },
);
const path = {
  print: mdiPrinterOutline,
  close: mdiClose,
  save: mdiContentSaveOutline,
};
const { callMap, mapId, moduleContainerProps, order } = useMap(props);
const { trans, setLocaleDefault } = useLang(mapId.value);
setLocaleDefault({
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
    control.sync();
    try {
      let image = await exportMapbox(map);
      if (cb) {
        cb(image);
      } else await onDownload(image);
    } finally {
      print.value.loading = false;
      control.sync();
    }
  });
}

async function onDownload(data64: string) {
  saveAs(data64, `${props.fileName}.png`);
}
const { state, control } = useToolbarControl(mapId.value, props, {
  id: 'mapPrintControl',
  getState() {
    return {
      visible: true,
      title: trans.value('map.print.title'),
      order: order.value,
      icon: {
        type: 'mdi',
        path: path.print,
      },
      loading: print.value.loading,
    };
  },
  onClick() {
    onSaveAll(onDownload);
  },
});
</script>
<template>
  <ModuleContainer v-bind="moduleContainerProps">
    <template #btn>
      <MapCommonButton v-if="state" :option="state" @click="control.onAction">
      </MapCommonButton>
    </template>
  </ModuleContainer>
</template>
