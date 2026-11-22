import { useDebugHost } from '@hungpvq/react-shared-log';

export function useDevtoolState() {
  const { isOpen, activeTab } = useDebugHost();
  return { isOpen, activeTab };
}

export type DevtoolTab = string;
