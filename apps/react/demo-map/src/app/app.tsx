import { Outlet } from 'react-router';
import { Devtools } from '@hungpvq/react-map-devtools';
import './app.module.css';

export function App() {
  return (
    <div className="app map-theme-light">
      <Outlet />
      <Devtools />
    </div>
  );
}

export default App;
