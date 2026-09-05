import type { ReactNode } from 'react';
import '../layout/map-page.css';

export function MapPageShell({ children }: { children: ReactNode }) {
  return <div className="map-page">{children}</div>;
}
