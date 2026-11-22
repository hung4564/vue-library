import '../layout/map-page.css';

import type { ReactNode } from 'react';

export function MapPageShell({ children }: { children: ReactNode }) {
  return <div className="map-page">{children}</div>;
}
