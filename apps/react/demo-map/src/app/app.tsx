import { Outlet } from 'react-router';
import './app.module.css';

export function App() {
  return (
    <div className="app map-theme-light">
      <Outlet />
    </div>
  );
}

export default App;
