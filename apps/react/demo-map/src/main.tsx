import { StrictMode } from 'react';
import * as ReactDOM from 'react-dom/client';
import { BrowserRouter, Route, Routes } from 'react-router';
import App from './app/app';
import { MapCorePage } from './views/map-core';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement,
);

root.render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/map-core" element={<MapCorePage />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
);
