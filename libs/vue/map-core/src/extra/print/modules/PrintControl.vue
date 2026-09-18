<script setup lang="ts">
import { type WithMapPropType } from '@hungpvq/map-core';
import { printMapToFile, PRINT_CONTROL_LOCALE } from '@hungpvq/map-core/print';
import { mdiButtonState } from '@hungpvq/map-core/toolbar';
import { mdiPrinterOutline } from '@mdi/js';
import { saveAs } from 'file-saver';
import { ref } from 'vue';
import MapCommonButton from '../../../components/MapCommonButton.vue';
import { useLang } from '../../../extra/lang/hook';
import { useRegisterMapControl } from '../../../extra/registry/useRegisterMapControl';
import { useToolbarControl } from '../../../extra/toolbar/helper';
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
const { callMap, mapId, moduleContainerProps, order } = useMap(props);
const { trans, registerLocale } = useLang(mapId.value);
registerLocale('en', PRINT_CONTROL_LOCALE);
const print = ref({ show: false, loading: false });
function onPrint() {
  callMap(async (map) => {
    print.value.loading = true;
    control.sync();
    try {
      await printMapToFile(map, {
        fileName: props.fileName,
        save: (dataUrl, name) => saveAs(dataUrl, name),
      });
    } finally {
      print.value.loading = false;
      control.sync();
    }
  });
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
        onPrint();
      },
    },
  ],
});
const { state, control } = useToolbarControl(mapId.value, props, {
  id: 'mapPrintControl',
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
