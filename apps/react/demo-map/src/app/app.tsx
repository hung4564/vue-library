import './app.module.css';

import { DEMO_DATASET_SOURCE_VIEWER_KEY } from '@hungpvq/demo-map-datasets';
import { bootstrapMapTheme } from '@hungpvq/map-core/theme';
import { UniversalRegistry } from '@hungpvq/react-map-core';
import { Outlet } from 'react-router';

import { DatasetSourceViewer } from '../views/dataset-data-management/dataset-source-viewer';

bootstrapMapTheme('auto');

UniversalRegistry.registerComponent(
  DEMO_DATASET_SOURCE_VIEWER_KEY,
  DatasetSourceViewer,
);

export function App() {
  return (
    <div className="app">
      <Outlet />
    </div>
  );
}

export default App;
