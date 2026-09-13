<script lang="ts">
export default { name: 'export-geo' };
</script>
<script setup lang="ts">
import { errorHandler, MapError } from '@hungpvq/map-core';
import type { IDataset } from '@hungpvq/map-dataset';
import {
  GEO_EXPORT_COMPONENT_KEY,
  GEO_EXPORT_DEFAULT_CRS,
  GEO_EXPORT_FORMAT_META,
  GEO_EXPORT_FORMATS,
  createGeoExportController,
  resolveGeoExportCrs,
  resolveGeoExportUiSlot,
  type ExportGeoGetCollection,
  type GeoExportHandler,
  type GeoExportScope,
  type GeoExportFormat,
} from '@hungpvq/map-dataset/geo-export';
import { DraggableModal } from '@hungpvq/vue-draggable';
import {
  ModuleContainer,
  RegistryItem,
  useMap,
  useShow,
} from '@hungpvq/vue-map-core';
import { computed, markRaw, onMounted, onUnmounted, ref, type Component } from 'vue';
import ExportGeoForm from './export-geo-form.vue';

const props = withDefaults(
  defineProps<{
    layer: IDataset;
    mapId?: string;
    formats?: GeoExportFormat[];
    filename?: string | ((layer: IDataset) => string);
    getCollection?: ExportGeoGetCollection;
    sourceCrs?: string | null;
    targetCrs?: string | null;
    scopes?: GeoExportScope[];
    defaultScope?: GeoExportScope;
    /** Prefer `exportHandler` — Vue `$attrs` treats `onExport` as an event. */
    exportHandler?: GeoExportHandler;
    /** Local form override: Registry key or Vue component (like AT cellComponent). */
    formComponent?: unknown;
    /** Local loading override: Registry key or Vue component. */
    loadingComponent?: unknown;
  }>(),
  {
    formats: () => [...GEO_EXPORT_FORMATS],
    sourceCrs: GEO_EXPORT_DEFAULT_CRS,
    targetCrs: GEO_EXPORT_DEFAULT_CRS,
    scopes: (): GeoExportScope[] => ['all'],
  },
);

const emit = defineEmits<{ close: [] }>();

const { moduleContainerProps } = useMap(props);
const [show, toggleShow] = useShow(true);

const controller = createGeoExportController(props.layer, {
  mapId: props.mapId,
  formats: props.formats,
  filename: props.filename,
  getCollection: props.getCollection,
  sourceCrs: props.sourceCrs,
  targetCrs: props.targetCrs,
  scopes: props.scopes,
  defaultScope: props.defaultScope,
  onExport: props.exportHandler,
  formComponent: props.formComponent,
  loadingComponent: props.loadingComponent,
});

function asRawSlotComponent(comp: unknown): Component | undefined {
  if (comp == null) return undefined;
  if (typeof comp === 'object') return markRaw(comp as Component);
  return comp as Component;
}

const formSlot = computed(() => {
  const opts = controller.getOptions();
  const slot = resolveGeoExportUiSlot(
    props.formComponent ?? opts.formComponent,
    GEO_EXPORT_COMPONENT_KEY.form,
    ExportGeoForm,
  );
  return {
    componentKey: slot.componentKey,
    defaultComponent: asRawSlotComponent(slot.defaultComponent),
  };
});

const loadingSlotValue = computed(
  () => props.loadingComponent ?? controller.getOptions().loadingComponent,
);

const tick = ref(0);
const unsub = controller.subscribe(() => {
  tick.value += 1;
});

const busy = computed(() => {
  tick.value;
  return controller.getState().busy;
});
const error = computed(() => {
  tick.value;
  return controller.getState().error;
});

const format = ref<GeoExportFormat>(
  (props.formats?.length ? props.formats : [...GEO_EXPORT_FORMATS])[0] ??
    'geojson',
);
const scope = ref<GeoExportScope>(
  props.defaultScope ??
    controller.suggestDefaultScope(props.mapId) ??
    'all',
);
/** Local input state — not `filename` (collides with prop name). */
const filenameInput = ref(controller.resolveFilename());
const target = ref(
  resolveGeoExportCrs({
    sourceCrs: props.sourceCrs,
    targetCrs: props.targetCrs,
  }).targetCrs,
);

const resolvedSource = computed(
  () =>
    resolveGeoExportCrs({
      sourceCrs: props.sourceCrs,
      targetCrs: target.value,
    }).sourceCrs,
);

const formatItems = computed(() =>
  (props.formats?.length ? props.formats : [...GEO_EXPORT_FORMATS]).map(
    (value) => ({
      value,
      text: GEO_EXPORT_FORMAT_META[value].name,
    }),
  ),
);

const scopeItems = computed(() => {
  const labels: Record<GeoExportScope, string> = {
    all: 'All features',
    filtered: 'Filtered (search / sort)',
    selected: 'Selected rows',
  };
  const list: GeoExportScope[] = props.scopes?.length
    ? props.scopes
    : ['all'];
  return list.map((value) => ({
    value,
    text: labels[value],
  }));
});

const showScope = computed(() => scopeItems.value.length > 1);

const title = computed(
  () => `Export · ${props.layer.getName?.() || props.layer.id || 'layer'}`,
);

const sourceHint = computed(
  () =>
    `Data CRS: EPSG:${resolvedSource.value} (unchanged when target matches)`,
);

onMounted(() => toggleShow(true));
onUnmounted(() => {
  unsub();
  controller.dispose();
});

/** Close shell → ComponentManagement removes this instance. */
function dismiss() {
  if (show.value) toggleShow(false);
  emit('close');
}

async function onDownload() {
  if (!controller.canExport()) return;
  try {
    const ok = await controller.run({
      format: format.value,
      scope: scope.value,
      filename: filenameInput.value,
      sourceCrs: resolvedSource.value,
      targetCrs: target.value,
      mapId: props.mapId,
    });
    if (ok) dismiss();
  } catch (err) {
    errorHandler.handle(
      new MapError('Geo export failed', 'DATASET_EXPORT_ERROR', {
        recoverable: true,
        cause: err,
        context: { format: format.value, layerId: props.layer.id },
      }),
    );
  }
}

const formProps = computed(() => ({
  format: format.value,
  formatItems: formatItems.value,
  scope: scope.value,
  scopeItems: scopeItems.value,
  showScope: showScope.value,
  filename: filenameInput.value,
  target: target.value,
  sourceHint: sourceHint.value,
  error: error.value,
  busy: busy.value,
  onFormatChange: (v: string) => {
    format.value = v as GeoExportFormat;
  },
  onScopeChange: (v: string) => {
    scope.value = v as GeoExportScope;
  },
  onFilenameChange: (v: string) => {
    filenameInput.value = v;
  },
  onTargetChange: (v: string) => {
    target.value = v;
  },
  onCancel: dismiss,
  onDownload,
  loadingComponent: loadingSlotValue.value,
}));
</script>

<template>
  <ModuleContainer v-bind="moduleContainerProps">
    <template #draggable="{ containerId }">
      <DraggableModal
        :show="show"
        :title="title"
        :container-id="containerId"
        :width="420"
        :height="showScope ? 460 : 420"
        :resizable="false"
        @update:show="toggleShow"
        @close="dismiss"
      >
        <RegistryItem
          :componentKey="formSlot.componentKey"
          :defaultComponent="formSlot.defaultComponent"
          :mapId="props.mapId"
          v-bind="formProps"
        />
      </DraggableModal>
    </template>
  </ModuleContainer>
</template>
