import fs from 'node:fs';
import path from 'node:path';

/** Files where every MapControlButton / map-control-button should be text. */
const ALL_TEXT_FILES = [
  'apps/vue/demo-map/src/views/dataset-data-management/form-edit.vue',
  'apps/vue/demo-map/src/views/dataset-menu/sample-toggle-show-button.vue',
  'apps/react/demo-map/src/views/sample-toggle-show-button.tsx',
  'apps/vue/demo-map/src/views/dataset-menu/sample-layer-toggle-show.vue',
  'apps/react/demo-map/src/views/sample-layer-toggle-show.tsx',
  'libs/react/map-core/src/extra/crs/CrsDisplaySettings.tsx',
  'libs/vue/map-core/src/extra/crs/modules/CrsDisplaySettings/CrsDisplaySettings.vue',
  'libs/react/map-core/src/extra/print/modules/PrintAdvancedControl.tsx',
  'libs/vue/map-core/src/extra/print/modules/PrintAdvancedControl.vue',
  'libs/react/map-core/src/modules/GotoControl/GotoControl.tsx',
  'libs/vue/map-core/src/modules/GotoControl/GotoControl.vue',
  'libs/react/map-core/src/modules/SettingControl/SettingControl.tsx',
  'libs/vue/map-core/src/modules/SettingControl/SettingControl.vue',
  'libs/react/map-core/src/modules/InfoControl/InfoControl.tsx',
  'libs/vue/map-core/src/modules/InfoControl/InfoControl.vue',
  'libs/react/map-core/src/modules/WorkerControl/WorkerControl.tsx',
  'libs/vue/map-core/src/modules/WorkerControl/WorkerControl.vue',
  'libs/react/map-devtools/src/ui/Devtools.tsx',
  'libs/vue/map-devtools/src/ui/Devtools.vue',
  'libs/react/map-devtools/src/ui/LogViewer.tsx',
  'libs/vue/map-devtools/src/ui/LogViewer.vue',
  'libs/react/map-devtools/src/ui/StoreViewer.tsx',
  'libs/vue/map-devtools/src/ui/StoreViewer.vue',
  'libs/react/map-dataset/src/modules/CreateControl/CreateControl.tsx',
  'libs/vue/map-dataset/src/modules/CreateControl/CreateControl.vue',
  'libs/react/map-dataset/src/modules/CreateControl/config/index.tsx',
  'libs/vue/map-dataset/src/modules/CreateControl/config/geojson-upload.vue',
  'libs/vue/map-dataset/src/modules/CreateControl/config/xyz-json.vue',
  'libs/react/map-dataset/src/modules/StyleControl/component/TabItem.tsx',
  'libs/vue/map-dataset/src/modules/StyleControl/component/tab-item.vue',
  'libs/react/map-dataset/src/modules/StyleControl/component/TabContent.tsx',
  'libs/vue/map-dataset/src/modules/StyleControl/component/tab-content.vue',
  'libs/react/map-dataset/src/modules/StyleControl/style/MultiStyle.tsx',
  'libs/vue/map-dataset/src/modules/StyleControl/style/multi-style.vue',
  'libs/react/map-dataset/src/modules/StyleControl/style/field/InputMultiple.tsx',
  'libs/vue/map-dataset/src/modules/StyleControl/style/field/InputMultiple.vue',
  'libs/react/map-dataset/src/modules/LayerControl/layer-item.tsx',
  'libs/vue/map-dataset/src/modules/LayerControl/part/item/layer-item.vue',
  'libs/react/map-dataset/src/modules/LayerControl/layer-sub-item.tsx',
  'libs/vue/map-dataset/src/modules/LayerControl/part/item/layer-sub-item.vue',
  'libs/react/map-dataset/src/modules/LayerControl/LayerList.tsx',
  'libs/vue/map-dataset/src/modules/LayerControl/part/LayerList.vue',
  'libs/react/map-dataset/src/modules/LayerControl/LayerControl.tsx',
  'libs/vue/map-dataset/src/modules/LayerControl/LayerControl.vue',
  'libs/react/map-dataset/src/modules/LayerControl/DraggableList/DraggableGroupItem.tsx',
  'libs/vue/map-dataset/src/modules/LayerControl/part/DraggableList/draggable-list-group.vue',
  'libs/vue/map-dataset/src/modules/List/ListGroupItem.vue',
  'libs/react/map-dataset/src/modules/LayerDetail/LayerDetail.tsx',
  'libs/vue/map-dataset/src/modules/LayerDetail/LayerDetail.vue',
  'libs/vue/map-dataset/src/modules/LayerDetail/table-td-copy.vue',
  'libs/react/map-dataset/src/modules/DatasetControl/DatasetControl.tsx',
  'libs/vue/map-dataset/src/modules/DatasetControl/DatasetControl.vue',
  'libs/react/map-dataset/src/modules/IdentifyControl/IdentifyResultControl.tsx',
  'libs/vue/map-dataset/src/modules/IdentifyControl/IdentifyResultControl.vue',
  'libs/react/map-dataset/src/modules/AttributeTable/AttributeTable.tsx',
  'libs/vue/map-dataset/src/modules/AttributeTable/AttributeTable.vue',
  'libs/react/map-dataset/src/extra/menu/dataset-menu-button.tsx',
  'libs/vue/map-dataset/src/extra/menu/dataset-menu-item.vue',
  'libs/react/map-dataset/src/extra/component/identify.tsx',
  'libs/vue/map-dataset/src/extra/component/identify.vue',
  'libs/react/map-dataset/src/extra/component/toggle-show-button.tsx',
  'libs/vue/map-dataset/src/extra/component/toggle-show-button.vue',
  'libs/vue/map-draw/src/modules/DrawControl/components/DrawDraftList.vue',
];

function addVariantText(src) {
  // Opening tags: <MapControlButton ...> or <map-control-button ...>
  return src.replace(
    /<(MapControlButton|map-control-button)(\s[^>]*)?>/g,
    (full, tag, attrs = '') => {
      if (/\bvariant\s*=/.test(attrs)) return full;
      // self-closing handled below
      const trimmed = attrs.trimEnd();
      if (trimmed.endsWith('/')) {
        // shouldn't happen for MapControlButton usually
        return full;
      }
      const insert = trimmed ? `${trimmed} variant="text"` : ' variant="text"';
      return `<${tag}${insert}>`;
    },
  ).replace(
    /<(MapControlButton|map-control-button)(\s[^>]*)?\/>/g,
    (full, tag, attrs = '') => {
      if (/\bvariant\s*=/.test(attrs)) return full;
      const trimmed = (attrs || '').trimEnd().replace(/\s*\/\s*$/, '');
      const insert = trimmed ? `${trimmed} variant="text"` : ' variant="text"';
      return `<${tag}${insert} />`;
    },
  );
}

let changed = 0;
for (const rel of ALL_TEXT_FILES) {
  const file = path.join(process.cwd(), rel);
  if (!fs.existsSync(file)) {
    console.warn('missing', rel);
    continue;
  }
  const orig = fs.readFileSync(file, 'utf8');
  const next = addVariantText(orig);
  if (next !== orig) {
    fs.writeFileSync(file, next);
    changed++;
    console.log(rel);
  } else {
    console.log('no-op', rel);
  }
}
console.log('changed', changed);
