<script setup lang="ts">
import { type WithMapPropType } from '@hungpvq/map-core';
import {
  createPrintAdvancedSession,
  type PrintAdvancedUiState,
  type PrintOption,
} from '@hungpvq/map-core/print';
import { mdiButtonState } from '@hungpvq/map-core/toolbar';
import { DraggableItemPopup } from '@hungpvq/vue-draggable';
import {
  mdiClose,
  mdiCogOutline,
  mdiContentSaveOutline,
  mdiPrinterEye,
} from '@mdi/js';
import { saveAs } from 'file-saver';
import { onBeforeUnmount, ref, watch } from 'vue';

import { defineProps, withDefaults } from 'vue';
import MapControlButton from '../../../components/MapControlButton.vue';
import { useLang } from '../../../extra/lang/hook';
import { useMapControl } from '../../../extra/registry/useMapControl';
import { InputSelect, InputText } from '../../../field';
import { defaultMapProps, useMap } from '../../../hooks/useMap';
import ModuleContainer from '../../../modules/ModuleContainer/ModuleContainer.vue';
import { useMapPrint } from '../store';

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
const { callMap, mapId, order } = useMap(props, onInit);
const { trans } = useLang(mapId.value);
const print = ref<PrintAdvancedUiState>({
  show: false,
  loading: false,
  setting_show: false,
  setting: {
    ratio: 1,
    orientation: 'portrait',
    format: 'png',
    paper: 'custom',
    dpi: 96,
    watermark: '',
  },
});

const syncToolbar = { run: () => undefined as void };

const session = createPrintAdvancedSession({
  callMap,
  saveFile: (dataUrl, name) => saveAs(dataUrl, name),
  getDisabledCrosshair: () => props.disabledCrosshair,
  getDisabledPrintableArea: () => props.disabledPrintableArea,
  getFileName: () => props.fileName,
  onStateChange: (next) => {
    print.value = next;
    syncToolbar.run();
  },
});

onBeforeUnmount(() => {
  session.destroy();
});

const { initPrint } = useMapPrint(mapId.value);
function onInit() {
  initPrint(session.getStoreHandlers());
}

const items = [
  { value: 'landscape', text: 'Landscape' },
  { value: 'portrait', text: 'Portrait' },
];
const paperItems = [
  { value: 'custom', text: 'Custom' },
  { value: 'a4', text: 'A4' },
  { value: 'letter', text: 'Letter' },
];

function onPaperChange(
  value: string | { value: string; text: string } | undefined,
) {
  const raw =
    value && typeof value === 'object' && 'value' in value
      ? value.value
      : value;
  session.applyPaper(String(raw ?? '') as NonNullable<PrintOption['paper']>);
}

const printButtons = [
  {
    id: 'mapPrintShow',
    getState: () =>
      mdiButtonState(path.print, {
        visible: !print.value.show,
        title: trans.value('map.print.title'),
      }),
    onClick: () => session.show(print.value.setting),
  },
  {
    id: 'mapPrintSave',
    getState: () =>
      mdiButtonState(path.save, {
        visible: print.value.show,
        title: trans.value('map.print.actions.save'),
        loading: print.value.loading,
      }),
    onClick: () => session.save(),
  },
  {
    id: 'mapPrintClose',
    getState: () =>
      mdiButtonState(path.close, {
        visible: print.value.show,
        title: trans.value('map.print.actions.clear'),
        loading: print.value.loading,
      }),
    onClick: () => session.close(),
  },
  {
    id: 'mapPrintSetting',
    getState: () =>
      mdiButtonState(path.setting, {
        visible: true,
        active: print.value.setting_show,
        title: trans.value('map.print.actions.setting'),
        loading: print.value.loading,
      }),
    onClick: () => session.toggleSetting(),
  },
];

const printModule = {
  moduleId: 'mapPrintAdvancedControl',
  order: order.value,
  kind: 'module' as const,
  orientation: 'row' as const,
  buttons: printButtons,
};

const { moduleContainerProps, panelBind, control } = useMapControl(mapId, {
  id: 'mapPrintAdvancedControl',
  panelKind: 'button',
  from: props,
  order,
  host: { button: printModule },
  defaultActionType: 'mapPrintShow',
  actions: [
    {
      type: 'mapPrintShow',
      run: () => session.show(print.value.setting),
    },
    {
      type: 'mapPrintSave',
      run: () => session.save(),
    },
    {
      type: 'mapPrintClose',
      run: () => session.close(),
    },
    {
      type: 'mapPrintSetting',
      run: () => session.toggleSetting(),
    },
  ],
  toolbar: printModule,
});
syncToolbar.run = () => control.sync();

watch(
  () => print.value.setting_show,
  () => control.sync(),
);
</script>
<template>
  <ModuleContainer v-bind="moduleContainerProps">
    <template #draggable="bind">
      <DraggableItemPopup
        v-if="print.setting_show"
        v-bind="{ ...bind, ...panelBind }"
        :height="340"
        :show="print.setting_show"
        :title="trans('map.print.setting.title')"
        @update:show="session.setSettingShow(!!$event)"
      >
        <div class="map-print-advanced-setting">
          <div>
            <input-select
              :model-value="print.setting.paper || 'custom'"
              :items="paperItems"
              :label="trans('map.print.field.paper')"
              @update:model-value="onPaperChange"
            />
          </div>
          <div>
            <input-text
              :model-value="print.setting.ratio"
              :label="trans('map.print.field.ratio')"
              @update:model-value="
                session.updateSetting({
                  ...print.setting,
                  paper: 'custom',
                  ratio: Number($event) || 1,
                })
              "
            />
          </div>
          <div>
            <input-select
              :model-value="print.setting.orientation"
              :items="items"
              :label="trans('map.print.field.orientation')"
              @update:model-value="
                session.updateSetting({
                  ...print.setting,
                  orientation: $event as PrintOption['orientation'],
                })
              "
            />
          </div>
          <div>
            <input-text
              :model-value="print.setting.dpi"
              :label="trans('map.print.field.dpi')"
              @update:model-value="
                session.updateSetting({
                  ...print.setting,
                  dpi: Number($event) || 96,
                })
              "
            />
          </div>
          <div>
            <input-text
              :model-value="print.setting.watermark"
              :label="trans('map.print.field.watermark')"
              @update:model-value="
                session.updateSetting({
                  ...print.setting,
                  watermark: String($event ?? ''),
                })
              "
            />
            <div
              v-if="print.setting.watermark"
              class="map-print-watermark-preview"
              aria-hidden="true"
            >
              {{ print.setting.watermark }}
            </div>
          </div>
          <div class="map-print-advanced-setting__grow"></div>
          <map-control-button
            class="map-print-advanced-setting__apply"
            @click="session.save()"
            v-if="print.show"
            variant="filled"
          >
            {{ trans('map.print.btn.apply') }}
          </map-control-button>
        </div>
      </DraggableItemPopup>
    </template>
  </ModuleContainer>
</template>
