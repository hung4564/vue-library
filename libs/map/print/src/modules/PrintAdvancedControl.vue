<script setup lang="ts">
import { DraggableItemPopup } from '@hungpvq/vue-draggable';
import {
  BaseButton,
  defaultMapProps,
  InputSelect,
  InputText,
  MapCommonButton,
  MapControlGroupButton,
  ModuleContainer,
  useLang,
  useMap,
  useToolbarControl,
  WithMapPropType,
} from '@hungpvq/vue-map-core';
import {
  mdiClose,
  mdiCogOutline,
  mdiContentSaveOutline,
  mdiPrinterEye,
} from '@mdi/js';
import { saveAs } from 'file-saver';
import { onBeforeUnmount, ref } from 'vue';
import { useMapPrint, type PrintOption } from '../store';
import {
  CrosshairManager,
  exportMapbox,
  exportMapboxWithOptions,
  PrintableAreaManager,
} from './print';
const props = withDefaults(
  defineProps<
    WithMapPropType & {
      disabledCrosshair?: boolean;
      disabledPrintableArea?: boolean;
      fileName?: string;
    }
  >(),
  {
    ...defaultMapProps,
    disabledCrosshair: false,
    disabledPrintableArea: false,
    fileName: 'map',
  },
);
const path = {
  print: mdiPrinterEye,
  close: mdiClose,
  save: mdiContentSaveOutline,
  setting: mdiCogOutline,
};
const { callMap, mapId, moduleContainerProps, order } = useMap(props, onInit);
const { trans, setLocaleDefault } = useLang(mapId.value);
setLocaleDefault({
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
const { initPrint } = useMapPrint(mapId.value);
function onInit() {
  initPrint({
    show: (options) => onShowPrint(options),
    close: () => onClosePrint(),
    save: (cb) => onSave(cb),
    saveAll: (cb) => onSaveAll(cb),
  });
}
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
async function onSave(cb?: (image: string) => Promise<void>) {
  callMap(async (map) => {
    if (!printableArea) return;
    try {
      print.value.loading = true;
      control.sync();
      let image = await exportMapboxWithOptions(
        map,
        printableArea.getCutSize(),
      );
      if (cb) {
        cb(image);
      } else {
        await onDownload(image);
      }
    } finally {
      print.value.loading = false;
      control.sync();
    }
  });
}
function onClosePrint() {
  print.value.loading = false;
  print.value.show = false;
  toggleCrosshair(print.value.show);
  togglePrintableArea(print.value.show, print.value.setting);
  control.sync();
}

function onShowPrint(options: PrintOption) {
  print.value.show = true;
  toggleCrosshair(print.value.show);
  togglePrintableArea(print.value.show, options);
  control.sync();
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
  control.sync();
}
function onChangeSetting() {
  if (printableArea) {
    printableArea.setOption(print.value.setting);
  }
}
const items = [
  { value: 'landscape', text: 'Landscape' },
  { value: 'portrait', text: 'Portrait' },
];

const { state, control } = useToolbarControl(mapId.value, props, {
  moduleId: 'mapPrintAdvancedControl',
  moduleOrder: order.value,
  kind: 'module',
  buttons: [
    {
      id: 'mapPrintShow',
      getState: () => ({
        visible: !print.value.show,
        title: trans.value('map.print.title'),
        icon: {
          type: 'mdi',
          path: path.print,
        },
      }),
      onClick: () => onShowPrint(print.value.setting),
    },
    {
      id: 'mapPrintSave',
      getState: () => ({
        visible: print.value.show,
        title: trans.value('map.print.actions.save'),
        icon: {
          type: 'mdi',
          path: path.save,
        },
        loading: print.value.loading,
      }),
      onClick: () => onSave(),
    },
    {
      id: 'mapPrintClose',
      getState: () => ({
        visible: print.value.show,
        title: trans.value('map.print.actions.clear'),
        icon: {
          type: 'mdi',
          path: path.close,
        },
        loading: print.value.loading,
      }),
      onClick: () => onClosePrint(),
    },
    {
      id: 'mapPrintSetting',
      getState: () => ({
        visible: true,
        active: print.value.setting_show,
        title: trans.value('map.print.actions.setting'),
        icon: {
          type: 'mdi',
          path: path.setting,
        },
        loading: print.value.loading,
      }),
      onClick: () => toggleSetting(),
    },
  ],
});
</script>
<template>
  <ModuleContainer v-bind="moduleContainerProps">
    <template #btn>
      <MapControlGroupButton row>
        <template v-if="!print.show">
          <MapCommonButton
            v-if="state && state.mapPrintShow"
            :option="state.mapPrintShow"
            @click="control.onAction('mapPrintShow', $event)"
          />
        </template>
        <template v-else>
          <MapCommonButton
            v-if="state && state.mapPrintSave"
            :option="state.mapPrintSave"
            @click="control.onAction('mapPrintSave', $event)"
          />
          <MapCommonButton
            v-if="state && state.mapPrintClose"
            :option="state.mapPrintClose"
            @click="control.onAction('mapPrintClose', $event)"
          />
        </template>
        <MapCommonButton
          v-if="state && state.mapPrintSetting"
          :option="state.mapPrintSetting"
          @click="control.onAction('mapPrintSetting', $event)"
        />
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
              :items="items"
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
