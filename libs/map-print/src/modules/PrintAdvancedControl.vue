<script setup lang="ts">
import { DraggableItemPopup } from '@hungpvq/vue-draggable';
import {
  BaseButton,
  InputSelect,
  InputText,
  MapControlButton,
  MapControlGroupButton,
  ModuleContainer,
  useLang,
  useMap,
  withMapProps,
} from '@hungpvq/vue-map-core';
import SvgIcon from '@jamescoyle/vue-icon';
import {
  mdiClose,
  mdiCogOutline,
  mdiContentSaveOutline,
  mdiPrinterEye,
} from '@mdi/js';
import { saveAs } from 'file-saver';
import { onBeforeUnmount, ref } from 'vue';
import { initPrint, type PrintOption } from '../store';
import {
  CrosshairManager,
  PrintableAreaManager,
  exportMapbox,
  exportMapboxWithOptions,
} from './print';
const props = defineProps({
  ...withMapProps,
  disabledCrosshair: Boolean,
  disabledPrintableArea: Boolean,
  fileName: { type: String, default: 'map' },
});
const path = {
  print: mdiPrinterEye,
  close: mdiClose,
  save: mdiContentSaveOutline,
  setting: mdiCogOutline,
};
const { callMap, mapId, moduleContainerProps } = useMap(props, onInit);
const { trans, setLocale } = useLang(mapId.value);
setLocale({
  map: {
    print: {
      title: 'Print',
      actions: { save: 'save', clear: 'clear', setting: 'Setting' },
      setting: {
        title: 'Setting',
      },
      field: {
        ratio: 'Ratio',
        orientation: 'Orientation',
      },
      btn: {
        apply: 'Print',
      },
    },
  },
});
const print = ref({
  show: false,
  loading: false,
  setting_show: false,
  setting: { ratio: 1, orientation: 'portrait' } as PrintOption,
});
onBeforeUnmount(() => {
  onClosePrint();
});
function onInit() {
  initPrint(mapId.value, {
    show: (options) => onShowPrint(options),
    close: () => onClosePrint(),
    save: (cb) => onSave(cb),
    saveAll: (cb) => onSaveAll(cb),
  });
}
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
async function onSave(cb?: (image: string) => Promise<void>) {
  callMap(async (map) => {
    if (!printableArea) return;
    try {
      print.value.loading = true;
      let image = await exportMapboxWithOptions(
        map,
        printableArea.getCutSize()
      );
      if (cb) {
        cb(image);
      } else {
        await onDownload(image);
      }
    } finally {
      print.value.loading = false;
    }
  });
}
function onClosePrint() {
  print.value.loading = false;
  print.value.show = false;
  toggleCrosshair(print.value.show);
  togglePrintableArea(print.value.show, print.value.setting);
}

function onShowPrint(options: PrintOption) {
  print.value.show = true;
  toggleCrosshair(print.value.show);
  togglePrintableArea(print.value.show, options);
}
async function onDownload(data64: string) {
  saveAs(data64, `${props.fileName}.png`);
}
let crosshair: CrosshairManager | undefined = undefined;
let printableArea: PrintableAreaManager | undefined = undefined;
function toggleCrosshair(show: boolean) {
  if (props.disabledCrosshair) {
    return;
  }
  callMap((map) => {
    if (show === false) {
      if (crosshair !== undefined) {
        crosshair.destroy();
        crosshair = undefined;
      }
    } else {
      crosshair = new CrosshairManager(map.getCanvas());
      crosshair.create();
    }
  });
}
function togglePrintableArea(show: boolean, options: PrintOption) {
  if (props.disabledPrintableArea) {
    return;
  }
  callMap((map) => {
    if (show === false) {
      map.off('resize', onMapResize);
      if (printableArea !== undefined) {
        printableArea.destroy();
        printableArea = undefined;
      }
    } else {
      map.on('resize', onMapResize);
      printableArea = new PrintableAreaManager(map.getCanvas(), options);
      printableArea.create();
    }
  });
}
function onMapResize() {
  if (printableArea) {
    printableArea.mapResize();
  }
  if (crosshair) {
    crosshair.mapResize();
  }
}
function toggleSetting() {
  print.value.setting_show = !print.value.setting_show;
}
function onChangeSetting() {
  if (printableArea) {
    printableArea.setOption(print.value.setting);
  }
}
</script>
<template>
  <ModuleContainer v-bind="moduleContainerProps">
    <template #btn>
      <MapControlGroupButton row>
        <MapControlButton
          v-if="!print.show"
          :active="print.show"
          :tooltip="trans('map.print.title')"
          @click.stop="onShowPrint(print.setting)"
          :loading="print.loading"
        >
          <SvgIcon :size="18" type="mdi" :path="path.print" />
        </MapControlButton>
        <template v-else>
          <MapControlButton
            :disabled="print.loading"
            :loading="print.loading"
            :tooltip="trans('map.print.actions.save')"
            @click="onSave()"
          >
            <SvgIcon :size="18" type="mdi" :path="path.save" />
          </MapControlButton>
          <MapControlButton
            :disabled="print.loading"
            :tooltip="trans('map.print.actions.clear')"
            @click="onClosePrint()"
          >
            <SvgIcon :size="18" type="mdi" :path="path.close" />
          </MapControlButton>
        </template>
        <MapControlButton
          :tooltip="trans('map.print.actions.setting')"
          @click="toggleSetting()"
          :active="print.setting_show"
        >
          <SvgIcon :size="18" type="mdi" :path="path.setting" />
        </MapControlButton>
      </MapControlGroupButton>
    </template>

    <template #draggable="props">
      <DraggableItemPopup
        v-if="print.setting_show"
        v-bind="props"
        :height="220"
        v-model:show="print.setting_show"
        :title="trans('map.print.setting.title')"
      >
        <div class="setting-container">
          <div>
            <input-text
              v-model="print.setting.ratio"
              :label="trans('map.print.field.ratio')"
              @change="onChangeSetting()"
            />
          </div>
          <div>
            <input-select
              v-model="print.setting.orientation"
              :items="[
                { value: 'landscape', text: 'Landscape' },
                { value: 'portrait', text: 'Portrait' },
              ]"
              :label="trans('map.print.field.orientation')"
              @change="onChangeSetting()"
            />
          </div>
          <div class="grow"></div>
          <base-button
            class="btn-container"
            @click="onSave()"
            v-if="print.show"
          >
            {{ trans('map.print.btn.apply') }}
          </base-button>
        </div>
      </DraggableItemPopup>
    </template>
  </ModuleContainer>
</template>
<style scoped>
.setting-container {
  padding: 8px;
  box-sizing: border-box;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: auto;
}
.setting-field-container > div {
  padding: 4px;
}
.setting-container .grow {
  flex: 1;
}
.setting-container .btn-container {
  flex-grow: 0;
  padding: 8px;
}
</style>
