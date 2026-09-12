import { DEMO_DATASET_SOURCE_VIEWER_KEY } from '@hungpvq/demo-map-datasets';
import { bootstrapMapTheme } from '@hungpvq/map-core/theme';
import { UniversalRegistry } from '@hungpvq/react-map-core';
import { Outlet } from 'react-router';
import { Devtools } from '@hungpvq/react-map-devtools';
import { DatasetSourceViewer } from '../views/dataset-data-management/dataset-source-viewer';
import './app.module.css';

bootstrapMapTheme('auto');

UniversalRegistry.registerComponent(
  DEMO_DATASET_SOURCE_VIEWER_KEY,
  DatasetSourceViewer,
);

export function App() {
  return (
    <div className="app">
      <Outlet />
      <Devtools />
    </div>
  );
}

export default App;
