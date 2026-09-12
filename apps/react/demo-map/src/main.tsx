import { StrictMode } from 'react';
import * as ReactDOM from 'react-dom/client';
import { HashRouter, Route, Routes } from 'react-router';
import { installMapApp } from '@hungpvq/react-map-dataset';
import { installDevtools } from '@hungpvq/react-map-devtools';
import App from './app/app';
import { AllMapView } from './views/all-map-view';
import { BasemapPage } from './views/basemap';
import { DatasetAttributeTablePage } from './views/dataset-attribute-table';
import { DatasetDataManagementPage } from './views/dataset-data-management';
import { DatasetHighlightPage } from './views/dataset-highlight';
import { DatasetIdentifyPage } from './views/dataset-identify';
import { DatasetIdentifyPresentPage } from './views/dataset-identify-present';
import { DatasetListPage } from './views/dataset-list';
import { DatasetMenuPage } from './views/dataset-menu';
import { DrawPage } from './views/draw';
import { MapCorePage } from './views/map-core';
import { MinimalPage } from './views/minimal';
import { MapDatasetPage } from './views/map-dataset';
import { MeasurementPage } from './views/measurement';
import { RegistryControlPage } from './views/registry-control';
import { StoryTellingPage } from './views/story-telling';
import { StoryTellingGpsPage } from './views/story-telling-gps';
import { LegendPage } from './views/legend';
import { ToolbarPage } from './views/toolbar';
import { MobileMenuPage } from './views/mobile-menu';
import { WorkerSamplePage } from './views/worker-sample';

// Theme stays in App as bootstrapMapTheme('auto'); dataset registry via installMapApp
installMapApp({ theme: false });
installDevtools();

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement,
);

root.render(
  <StrictMode>
    <HashRouter>
      <Routes>
        <Route path="/" element={<App />}>
          <Route index element={<AllMapView />} />
          <Route path="map-core" element={<MapCorePage />} />
          <Route path="minimal" element={<MinimalPage />} />
          <Route path="worker-sample" element={<WorkerSamplePage />} />
          <Route path="map-dataset" element={<MapDatasetPage />} />
          <Route path="toolbar" element={<ToolbarPage />} />
          <Route path="mobile-menu" element={<MobileMenuPage />} />
          <Route path="basemap" element={<BasemapPage />} />
          <Route path="measurement" element={<MeasurementPage />} />
          <Route path="dataset-highlight" element={<DatasetHighlightPage />} />
          <Route path="dataset-identify" element={<DatasetIdentifyPage />} />
          <Route
            path="dataset-identify-present"
            element={<DatasetIdentifyPresentPage />}
          />
          <Route path="dataset-menu" element={<DatasetMenuPage />} />
          <Route path="dataset-list" element={<DatasetListPage />} />
          <Route path="registry-control" element={<RegistryControlPage />} />
          <Route
            path="dataset-data-management"
            element={<DatasetDataManagementPage />}
          />
          <Route
            path="dataset-attribute-table"
            element={<DatasetAttributeTablePage />}
          />
          <Route path="story-telling" element={<StoryTellingPage />} />
          <Route path="story-telling-gps" element={<StoryTellingGpsPage />} />
          <Route path="legend" element={<LegendPage />} />
          <Route path="draw" element={<DrawPage />} />
        </Route>
      </Routes>
    </HashRouter>
  </StrictMode>,
);
