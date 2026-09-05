/**
 * React Context for Map component
 * Provides mapId and other map-related values to child components
 */

import { createContext, useContext } from 'react';

export interface MapContextValue {
  mapId: string;
  dragId: string;
  registerModuleOrder?: (key: string) => number;
}

export const MapContext = createContext<MapContextValue | null>(null);

/**
 * Hook to access map context
 */
export function useMapContext(): MapContextValue {
  const context = useContext(MapContext);
  if (!context) {
    throw new Error('useMapContext must be used within a MapContext.Provider');
  }
  return context;
}

/**
 * Map context provider component
 */
export function MapContextProvider({
  value,
  children,
}: {
  value: MapContextValue;
  children: React.ReactNode;
}) {
  return <MapContext.Provider value={value}>{children}</MapContext.Provider>;
}
