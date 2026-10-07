<script setup lang="ts">
import { type WithMapPropType } from '@hungpvq/map-core';
import { printMapToFile } from '@hungpvq/map-core/print';
import { mdiButtonState } from '@hungpvq/map-core/toolbar';
import { mdiPrinterOutline } from '@mdi/js';
import { saveAs } from 'file-saver';
import { ref } from 'vue';

import { defineProps, withDefaults } from 'vue';
import { useLang } from '../../../extra/lang/hook';
import { useMapControl } from '../../../extra/registry/useMapControl';
import { defaultMapProps, useMap } from '../../../hooks/useMap';
import ModuleContainer from '../../../modules/ModuleContainer/ModuleContainer.vue';
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
};
const { callMap, mapId, order } = useMap(props);
const { trans } = useLang(mapId.value);
const print = ref({ show: false, loading: false });
function onPrint() {
  callMap(async (map) => {
    print.value.loading = true;
    control?.sync();
    try {
      await printMapToFile(map, {
        fileName: props.fileName,
        save: (dataUrl, name) => saveAs(dataUrl, name),
      });
    } finally {
      print.value.loading = false;
      control?.sync();
    }
  });
}
const singleButton = {
  kind: 'single' as const,
  getState() {
    return mdiButtonState(path.print, {
      visible: true,
      title: trans.value('map.print.title'),
      order: order.value,
      loading: print.value.loading,
    });
  },
  onClick() {
    onPrint();
  },
};
const { moduleContainerProps, control } = useMapControl(mapId, {
  id: 'mapPrintControl',
  panelKind: 'button',
  from: props,
  order,
  actions: [
    {
      type: 'mapPrintControl',
      run: () => {
        onPrint();
      },
    },
  ],
  host: { button: singleButton },
  toolbar: singleButton,
});
</script>
<template>
  <ModuleContainer v-bind="moduleContainerProps" />
</template>
