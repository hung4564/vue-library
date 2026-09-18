/**
 * React Context for Map component
 * Provides mapId and other map-related values to child components
 */

import type { ButtonInMobile } from '@hungpvq/map-core';
import { createContext, useContext, type ReactNode } from 'react';

export interface MapContextValue {
  mapId: string;
  dragId: string;
  registerModuleOrder?: (key: string) => number;
  buttonInMobile?: ButtonInMobile;
  isMobile?: boolean;
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
  children: ReactNode;
}) {
  return <MapContext.Provider value={value}>{children}</MapContext.Provider>;
}
