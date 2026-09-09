import { bootstrapMapTheme } from '@hungpvq/map-core/theme';
import { Outlet } from 'react-router';
import { Devtools } from '@hungpvq/react-map-devtools';
import './app.module.css';

bootstrapMapTheme('auto');

export function App() {
  return (
    <div className="app">
      <Outlet />
      <Devtools />
    </div>
  );
}

export default App;
