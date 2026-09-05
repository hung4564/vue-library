<script setup lang="ts">
import { exportMapbox, PRINT_CONTROL_LOCALE, type WithMapPropType } from '@hungpvq/map-core';
import { mdiClose, mdiContentSaveOutline, mdiPrinterOutline } from '@mdi/js';
import { saveAs } from 'file-saver';
import { ref } from 'vue';
import { MapCommonButton } from '../../../components';
import { useLang } from '../../../extra/lang';
import { useRegisterMapControl } from '../../../extra/registry';
import { useToolbarControl } from '../../../extra/toolbar';
import { defaultMapProps, useMap } from '../../../hooks/useMap';
import { ModuleContainer } from '../../../modules';
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
setLocaleDefault(PRINT_CONTROL_LOCALE);
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
useRegisterMapControl(mapId, {
  id: 'mapPrintControl',
  panelKind: 'button',
  buttonPosition: () => props.position,
  getProps: () => ({
    position: props.position,
    controlLayout: props.controlLayout,
  }),
  actions: [
    {
      type: 'mapPrintControl',
      run: () => {
        onSaveAll(onDownload);
      },
    },
  ],
});
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
      <MapCommonButton
        v-if="state"
        :option="state"
        @click.stop="control.onAction"
      >
      </MapCommonButton>
    </template>
  </ModuleContainer>
</template>
