import { StrictMode } from 'react';
import * as ReactDOM from 'react-dom/client';
import { HashRouter, Route, Routes } from 'react-router';
import { installDevtools } from '@hungpvq/react-map-devtools';
import App from './app/app';
import { installDatasetRegistry } from './hooks/useDatasetRegistry';
import { AllMapView } from './views/all-map-view';
import { BasemapPage } from './views/basemap';
import { DatasetDataManagementPage } from './views/dataset-data-management';
import { DatasetHighlightPage } from './views/dataset-highlight';
import { DatasetIdentifyPage } from './views/dataset-identify';
import { DatasetListPage } from './views/dataset-list';
import { DatasetMenuPage } from './views/dataset-menu';
import { InspectPage } from './views/inspect';
import { MapCorePage } from './views/map-core';
import { MapDatasetPage } from './views/map-dataset';
import { MeasurementPage } from './views/measurement';
import { StoryTellingPage } from './views/story-telling';
import { ToolbarPage } from './views/toolbar';

// Match Vue: register legend/menu/style components before any map mounts
installDatasetRegistry();
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
          <Route path="map-dataset" element={<MapDatasetPage />} />
          <Route path="toolbar" element={<ToolbarPage />} />
          <Route path="basemap" element={<BasemapPage />} />
          <Route path="measurement" element={<MeasurementPage />} />
          <Route path="dataset-highlight" element={<DatasetHighlightPage />} />
          <Route path="dataset-identify" element={<DatasetIdentifyPage />} />
          <Route path="dataset-menu" element={<DatasetMenuPage />} />
          <Route path="dataset-list" element={<DatasetListPage />} />
          <Route
            path="dataset-data-management"
            element={<DatasetDataManagementPage />}
          />
          <Route path="story-telling" element={<StoryTellingPage />} />
          <Route path="story-telling-gps" element={<StoryTellingPage />} />
          <Route path="inspect" element={<InspectPage />} />
        </Route>
      </Routes>
    </HashRouter>
  </StrictMode>,
);
