import { getDatasetDebugApi } from '@hungpvq/map-debug/dataset';
import { registerDebugTab } from '@hungpvq/react-shared-log';

import { DatasetMenuViewer } from './ui/DatasetMenuViewer';

export function registerDatasetDebugTab(): () => void {
  return registerDebugTab({
    id: 'dataset',
    label: 'Dataset',
    order: 10,
    hidden: () => !getDatasetDebugApi(),
    component: DatasetMenuViewer,
  });
}
