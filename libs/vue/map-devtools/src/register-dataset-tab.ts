import { getDatasetDebugApi } from '@hungpvq/map-debug/dataset';
import { registerDebugTab } from '@hungpvq/vue-shared-log';

import DatasetMenuViewer from './ui/DatasetMenuViewer.vue';

export function registerDatasetDebugTab(): () => void {
  return registerDebugTab({
    id: 'dataset',
    label: 'Dataset',
    order: 10,
    hidden: () => !getDatasetDebugApi(),
    component: DatasetMenuViewer,
  });
}
