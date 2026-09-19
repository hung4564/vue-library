import '@hungpvq/map-core/style.css';
import '@hungpvq/map-dataset/style.css';
import '@hungpvq/react-draggable/style.css';
import '@hungpvq/react-map-core/style.css';
import { installMapApp } from '@hungpvq/react-map-dataset';
import '@hungpvq/react-map-dataset/style.css';
import { installDevtools } from '@hungpvq/react-map-devtools';
import '@hungpvq/react-map-devtools/style.css';
import '@hungpvq/react-map-draw/style.css';
import 'maplibre-gl/dist/maplibre-gl.css';
import { StrictMode } from 'react';
import * as ReactDOM from 'react-dom/client';
import { HashRouter, Route, Routes } from 'react-router';
import App from './app/app';
import { AllMapView } from './views/all-map-view';
import { BasemapPage } from './views/basemap';
import { BasemapErrorPage } from './views/basemap-error';
import { CrsPage } from './views/crs';
import { DatasetAttributeTablePage } from './views/dataset-attribute-table';
import { DatasetDataManagementPage } from './views/dataset-data-management';
import { DatasetGeoExportPage } from './views/dataset-geo-export';
import { DatasetHighlightPage } from './views/dataset-highlight';
import { DatasetIdentifyPage } from './views/dataset-identify';
import { DatasetIdentifyPresentPage } from './views/dataset-identify-present';
import { DatasetListPage } from './views/dataset-list';
import { DatasetMenuPage } from './views/dataset-menu';
import { DevtoolsPage } from './views/devtools';
import { DrawPage } from './views/draw';
import { LanguagePage } from './views/language';
import { LegendPage } from './views/legend';
import { LoggingCookbookPage } from './views/logging-cookbook';
import { MapCorePage } from './views/map-core';
import { MapDatasetPage } from './views/map-dataset';
import { MeasurementPage } from './views/measurement';
import { MinimalPage } from './views/minimal';
import { MobileMenuPage } from './views/mobile-menu';
import { MultiMapPage } from './views/multi-map';
import { PrintPage } from './views/print';
import { RegistryControlPage } from './views/registry-control';
import { SharedLogPage } from './views/shared-log';
import { StoryTellingPage } from './views/story-telling';
import { StoryTellingGpsPage } from './views/story-telling-gps';
import { ThemePage } from './views/theme';
import { ToolbarPage } from './views/toolbar';
import { WorkerSamplePage } from './views/worker-sample';

// Theme stays in App as bootstrapMapTheme('auto'); dataset registry via installMapApp
installMapApp({ theme: false });
installDevtools();

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement,
);

root.render(
  // <StrictMode>
  <HashRouter>
    <Routes>
      <Route path="/" element={<App />}>
        <Route index element={<AllMapView />} />
        <Route path="map-core" element={<MapCorePage />} />
        <Route path="language" element={<LanguagePage />} />
        <Route path="minimal" element={<MinimalPage />} />
        <Route path="worker-sample" element={<WorkerSamplePage />} />
        <Route path="map-dataset" element={<MapDatasetPage />} />
        <Route path="toolbar" element={<ToolbarPage />} />
        <Route path="mobile-menu" element={<MobileMenuPage />} />
        <Route path="basemap" element={<BasemapPage />} />
        <Route path="basemap-error" element={<BasemapErrorPage />} />
        <Route path="multi-map" element={<MultiMapPage />} />
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
        <Route path="dataset-geo-export" element={<DatasetGeoExportPage />} />
        <Route path="story-telling" element={<StoryTellingPage />} />
        <Route path="story-telling-gps" element={<StoryTellingGpsPage />} />
        <Route path="legend" element={<LegendPage />} />
        <Route path="draw" element={<DrawPage />} />
        <Route path="print" element={<PrintPage />} />
        <Route path="crs" element={<CrsPage />} />
        <Route path="devtools" element={<DevtoolsPage />} />
        <Route path="logging-cookbook" element={<LoggingCookbookPage />} />
        <Route path="shared-log" element={<SharedLogPage />} />
        <Route path="theme" element={<ThemePage />} />
      </Route>
    </Routes>
  </HashRouter>,
  // </StrictMode>,
);
